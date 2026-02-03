"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
});

type InvitationInput = z.infer<typeof invitationSchema>;

interface InvitationFormProps {
  providerId: string;
}

export function InvitationForm({ providerId }: InvitationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvitationInput>({
    resolver: zodResolver(invitationSchema),
  });

  const onSubmit = async (data: InvitationInput) => {
    setIsLoading(true);
    const supabase = createClient();

    // Check if invitation already exists
    const { data: existing } = await supabase
      .from("invitations")
      .select("id, status")
      .eq("provider_id", providerId)
      .eq("email", data.email)
      .eq("status", "pending")
      .single();

    if (existing) {
      toast.error("An invitation has already been sent to this email");
      setIsLoading(false);
      return;
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        provider_id: providerId,
        email: data.email,
        message: data.message || null,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to send invitation");
      setIsLoading(false);
      return;
    }

    await createAuditLog({
      action: "invitation.create",
      resourceType: "invitation",
      resourceId: invitation.id,
      details: { email: data.email },
    });

    toast.success(`Invitation sent to ${data.email}`);
    reset();
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Patient Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="patient@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Personal Message (optional)</Label>
        <Textarea
          id="message"
          placeholder="Add a personal message to your invitation..."
          {...register("message")}
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send Invitation
      </Button>
    </form>
  );
}
