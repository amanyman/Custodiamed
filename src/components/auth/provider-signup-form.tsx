"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  providerSignupSchema,
  type ProviderSignupInput,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProviderSignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderSignupInput>({
    resolver: zodResolver(providerSignupSchema),
  });

  const onSubmit = async (data: ProviderSignupInput) => {
    setIsLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: "provider",
          practice_name: data.practiceName,
          specialty: data.specialty,
          npi_number: data.npiNumber,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // If user is created and session exists, redirect to dashboard
    if (authData.user && authData.session) {
      toast.success("Account created successfully!");
      router.push("/provider");
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
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Dr. Jane Smith"
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
          placeholder="you@practice.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="practiceName">Practice Name</Label>
          <Input
            id="practiceName"
            type="text"
            placeholder="City Medical Center"
            {...register("practiceName")}
          />
          {errors.practiceName && (
            <p className="text-sm text-destructive">
              {errors.practiceName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            type="text"
            placeholder="Radiology"
            {...register("specialty")}
          />
          {errors.specialty && (
            <p className="text-sm text-destructive">
              {errors.specialty.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="npiNumber">NPI Number</Label>
        <Input
          id="npiNumber"
          type="text"
          placeholder="1234567890"
          maxLength={10}
          {...register("npiNumber")}
        />
        {errors.npiNumber && (
          <p className="text-sm text-destructive">{errors.npiNumber.message}</p>
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
        Create Provider Account
      </Button>
    </form>
  );
}
