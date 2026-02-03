import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Mail, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";

export default async function ProviderDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get provider record
  const { data: provider } = await supabase
    .from("providers")
    .select("id, practice_name")
    .eq("user_id", user!.id)
    .single();

  // Get stats
  const { count: patientsCount } = await supabase
    .from("patient_provider_relationships")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider?.id || "")
    .eq("status", "active");

  const { count: receivedFilesCount } = await supabase
    .from("file_shares")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider?.id || "")
    .eq("status", "active");

  const { count: pendingReviewCount } = await supabase
    .from("file_shares")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider?.id || "")
    .eq("status", "active")
    .is("reviewed_at", null);

  const { count: pendingInvitationsCount } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider?.id || "")
    .eq("status", "pending");

  const stats = [
    {
      title: "Connected Patients",
      value: patientsCount || 0,
      icon: Users,
      href: "/provider/patients",
    },
    {
      title: "Received Files",
      value: receivedFilesCount || 0,
      icon: FileText,
      href: "/provider/received",
    },
    {
      title: "Pending Review",
      value: pendingReviewCount || 0,
      icon: Eye,
      href: "/provider/received",
    },
    {
      title: "Pending Invitations",
      value: pendingInvitationsCount || 0,
      icon: Mail,
      href: "/provider/invitations",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground">{provider?.practice_name}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Invite a Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Send an invitation to a patient to share their medical imaging
              </p>
              <Link href="/provider/invitations">
                <Button className="gap-2">
                  Send Invitation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Review Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {pendingReviewCount || 0} files awaiting your review
              </p>
              <Link href="/provider/received">
                <Button variant="outline" className="gap-2">
                  View Received Files
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentShares providerId={provider?.id} />
    </div>
  );
}

async function RecentShares({ providerId }: { providerId: string | undefined }) {
  if (!providerId) return null;

  const supabase = await createClient();

  const { data: shares } = await supabase
    .from("file_shares")
    .select(`
      id,
      status,
      created_at,
      reviewed_at,
      medical_files(original_filename, file_type),
      patients(
        profiles(full_name)
      )
    `)
    .eq("provider_id", providerId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!shares || shares.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No files have been shared with you yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/provider/received">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(shares as any[]).map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">
                    {share.medical_files?.original_filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From {share.patients?.profiles?.full_name} •{" "}
                    {new Date(share.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {share.reviewed_at ? (
                  <span className="text-sm text-green-500">Reviewed</span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Pending review
                  </span>
                )}
                <Link href={`/provider/received/${share.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
