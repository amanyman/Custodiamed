import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create it (fallback for failed triggers)
  if (!profile) {
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

    // Also create provider record if role is provider
    if (role === "provider") {
      const practiceName = user.user_metadata?.practice_name || "";
      const specialty = user.user_metadata?.specialty || "";
      const npiNumber = user.user_metadata?.npi_number || "";

      await supabase.from("providers").insert({
        user_id: user.id,
        practice_name: practiceName,
        specialty: specialty,
        npi_number: npiNumber,
      });
    }
  }

  if (profile.role !== "provider") {
    redirect("/patient");
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        role="provider"
        user={{
          email: profile.email,
          full_name: profile.full_name,
        }}
      />
      <main className="flex-1 overflow-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
}
