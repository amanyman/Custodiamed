"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "patient" | "provider";
}

interface ProfileFormProps {
  profile: Profile;
  additionalData: Record<string, string | null>;
  role: "patient" | "provider";
}

export function ProfileForm({ profile, additionalData, role }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    full_name: profile.full_name,
    ...additionalData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev: Record<string, string | null>) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: formData.full_name })
      .eq("id", profile.id);

    if (profileError) {
      toast.error("Failed to update profile");
      setIsLoading(false);
      return;
    }

    // Update role-specific data
    if (role === "patient") {
      const { error } = await supabase
        .from("patients")
        .update({
          date_of_birth: formData.date_of_birth || null,
          phone: formData.phone || null,
        })
        .eq("user_id", profile.id);

      if (error) {
        toast.error("Failed to update patient info");
        setIsLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("providers")
        .update({
          practice_name: formData.practice_name || "",
          specialty: formData.specialty || "",
          phone: formData.phone || null,
          address: formData.address || null,
        })
        .eq("user_id", profile.id);

      if (error) {
        toast.error("Failed to update provider info");
        setIsLoading(false);
        return;
      }
    }

    await createAuditLog({
      action: "profile.update",
      resourceType: "profile",
      resourceId: profile.id,
    });

    toast.success("Profile updated successfully");
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
      </div>

      {role === "patient" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </>
      )}

      {role === "provider" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="practice_name">Practice Name</Label>
            <Input
              id="practice_name"
              name="practice_name"
              value={formData.practice_name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              value={formData.specialty || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npi_number">NPI Number</Label>
            <Input
              id="npi_number"
              name="npi_number"
              value={formData.npi_number || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              NPI number cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Enter your practice address"
            />
          </div>
        </>
      )}

      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Changes
      </Button>
    </form>
  );
}
