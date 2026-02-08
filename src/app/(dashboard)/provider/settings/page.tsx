import { redirect } from "next/navigation";
import { getUser, getProfile, getProvider } from "@/lib/supabase/cached";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProviderSettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [profile, provider] = await Promise.all([
    getProfile(user.id),
    getProvider(user.id),
  ]);

  if (!profile || !provider) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and practice information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal and practice information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={profile}
            additionalData={{
              practice_name: provider.practice_name,
              specialty: provider.specialty,
              npi_number: provider.npi_number,
              phone: provider.phone,
              address: provider.address,
            }}
            role="provider"
          />
        </CardContent>
      </Card>
    </div>
  );
}
