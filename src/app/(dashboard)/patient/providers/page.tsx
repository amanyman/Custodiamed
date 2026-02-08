import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";

export default async function ProvidersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    redirect("/login");
  }

  // Get connected providers
  const { data: relationships } = await supabase
    .from("patient_provider_relationships")
    .select(`
      id,
      status,
      connected_at,
      providers(
        id,
        practice_name,
        specialty,
        profiles(full_name, email)
      )
    `)
    .eq("patient_id", patient.id)
    .eq("status", "active");

  // Get pending invitations
  const { data: pendingInvitations } = await supabase
    .from("invitations")
    .select(`
      id,
      message,
      created_at,
      providers(
        id,
        practice_name,
        specialty,
        profiles(full_name)
      )
    `)
    .eq("email", user.email)
    .eq("status", "pending");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Providers</h2>
        <p className="text-muted-foreground">
          Healthcare providers you&apos;re connected with
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Pending Invitations</h3>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(pendingInvitations as any[]).map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {invitation.providers?.profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invitation.providers?.practice_name} •{" "}
                        {invitation.providers?.specialty}
                      </p>
                      {invitation.message && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          &quot;{invitation.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/invitations/${invitation.id}/accept`} method="POST">
                      <Button type="submit">Accept</Button>
                    </form>
                    <form action={`/api/invitations/${invitation.id}/decline`} method="POST">
                      <Button type="submit" variant="outline">
                        Decline
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Connected Providers */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Connected Providers</h3>
        {!relationships || relationships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No providers yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                When a healthcare provider sends you an invitation, it will
                appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(relationships as any[]).map((relationship) => (
              <Card key={relationship.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {relationship.providers?.profiles?.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {relationship.providers?.specialty}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {relationship.providers?.practice_name}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Connected since{" "}
                    {new Date(relationship.connected_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
