"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SignupFormProps {
  providerId?: string;
  providerName?: string | null;
}

export function SignupForm({ providerId, providerName }: SignupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: "patient",
          invited_by_provider: providerId || null,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // If user is created and session exists, create the provider relationship
    if (authData.user && authData.session && providerId) {
      // Get the patient record
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (patient) {
        // Create the relationship
        await supabase.from("patient_provider_relationships").insert({
          patient_id: patient.id,
          provider_id: providerId,
          status: "active",
        });
      }
    }

    // If user is created and session exists, redirect to dashboard
    if (authData.user && authData.session) {
      toast.success("Account created successfully!");
      router.push("/patient");
      router.refresh();
    } else if (authData.user && !authData.session) {
      // Email confirmation is required
      toast.success("Check your email to confirm your account");
      router.push("/login");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {providerName && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-sm">
          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
          <span>
            You&apos;ll be automatically connected to <strong>{providerName}</strong>
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full h-12 font-medium btn-glow shadow-lg shadow-primary/25" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
