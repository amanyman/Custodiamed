import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/supabase/cached";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await getProfile(user.id);

  // If profile doesn't exist, create it (fallback for failed triggers)
  if (!profile) {
    const supabase = await createClient();
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const role = user.user_metadata?.role || "patient";

    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        role: role,
      })
      .select()
      .single();

    if (profileError || !newProfile) {
      // If we still can't create profile, sign out and redirect
      await supabase.auth.signOut();
      redirect("/login?error=profile_creation_failed");
    }

    profile = newProfile;

    // Also create patient record if role is patient
    if (role === "patient") {
      await supabase.from("patients").insert({
        user_id: user.id,
      });
    }
  }

  if (profile.role !== "patient") {
    redirect("/provider");
  }

  return (
    <DashboardShell
      role="patient"
      user={{
        email: profile.email,
        full_name: profile.full_name,
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}
