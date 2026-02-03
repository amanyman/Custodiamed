import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, FileText, ArrowRight, Mail } from "lucide-react";

export default async function PatientsPage() {
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

  // Get connected patients with their file share counts
  const { data: relationships } = await supabase
    .from("patient_provider_relationships")
    .select(`
      id,
      status,
      connected_at,
      patients(
        id,
        profiles(full_name, email)
      )
    `)
    .eq("provider_id", provider.id)
    .eq("status", "active");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relationshipsData = (relationships || []) as any[];

  // Get file share counts for each patient
  const patientIds = relationshipsData.map((r) => r.patients?.id).filter(Boolean) || [];

  const { data: shareCounts } = patientIds.length > 0
    ? await supabase
        .from("file_shares")
        .select("patient_id")
        .eq("provider_id", provider.id)
        .eq("status", "active")
        .in("patient_id", patientIds)
    : { data: [] };

  const shareCountMap = (shareCounts || []).reduce((acc, share) => {
    acc[share.patient_id] = (acc[share.patient_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Patients</h2>
          <p className="text-muted-foreground">
            Patients who have connected with you
          </p>
        </div>
        <Link href="/provider/invitations">
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Invite Patient
          </Button>
        </Link>
      </div>

      {!relationships || relationships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No patients yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Send invitations to patients to connect with them
            </p>
            <Link href="/provider/invitations" className="mt-4">
              <Button>Send First Invitation</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relationshipsData.map((relationship) => {
            const shareCount = shareCountMap[relationship.patients?.id || ""] || 0;

            return (
              <Card key={relationship.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {relationship.patients?.profiles?.full_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {relationship.patients?.profiles?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {shareCount} file{shareCount !== 1 ? "s" : ""} shared
                      </Badge>
                    </div>
                    <Link href={`/provider/patients/${relationship.patients?.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Connected since{" "}
                    {new Date(relationship.connected_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
