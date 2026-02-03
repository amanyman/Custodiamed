import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import { InvitationForm } from "@/components/invitations/invitation-form";

export default async function InvitationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    redirect("/login");
  }

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false });

  const pendingInvitations = invitations?.filter((i) => i.status === "pending") || [];
  const pastInvitations = invitations?.filter((i) => i.status !== "pending") || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Invitations</h2>
        <p className="text-muted-foreground">
          Invite patients to share their medical imaging with you
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Send Invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              Enter the patient&apos;s email address to send them an invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationForm providerId={provider.id} />
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({pendingInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending invitations
              </p>
            ) : (
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Sent {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past Invitations */}
      {pastInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {invitation.status === "accepted" ? (
                    <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      Accepted
                    </Badge>
                  ) : invitation.status === "expired" ? (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-destructive">
                      <XCircle className="h-3 w-3" />
                      Cancelled
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
