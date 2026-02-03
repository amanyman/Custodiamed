import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, FileImage, Eye } from "lucide-react";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Get patient details
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      id,
      date_of_birth,
      profiles(full_name, email)
    `)
    .eq("id", id)
    .single();

  if (!patient) {
    notFound();
  }

  // Verify the provider has a relationship with this patient
  const { data: relationship } = await supabase
    .from("patient_provider_relationships")
    .select("id, status, connected_at")
    .eq("patient_id", id)
    .eq("provider_id", provider.id)
    .eq("status", "active")
    .single();

  if (!relationship) {
    notFound();
  }

  // Get shared files from this patient
  const { data: shares } = await supabase
    .from("file_shares")
    .select(`
      id,
      status,
      created_at,
      reviewed_at,
      provider_notes,
      medical_files(
        id,
        original_filename,
        file_type,
        modality,
        study_date
      )
    `)
    .eq("patient_id", id)
    .eq("provider_id", provider.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientData = patient as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharesData = (shares || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/provider/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {patientData.profiles?.full_name}
            </h2>
            <p className="text-muted-foreground">{patientData.profiles?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p>{patientData.profiles?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{patientData.profiles?.email}</p>
            </div>
            {patientData.date_of_birth && (
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p>{new Date(patientData.date_of_birth).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Connected Since</p>
              <p>{new Date(relationship.connected_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Shared Files */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shared Files ({sharesData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sharesData.length === 0 ? (
                <p className="text-muted-foreground">
                  This patient hasn&apos;t shared any files with you yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {sharesData.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileImage className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">
                            {share.medical_files?.original_filename}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{share.medical_files?.file_type}</span>
                            {share.medical_files?.modality && (
                              <>
                                <span>•</span>
                                <span>{share.medical_files.modality}</span>
                              </>
                            )}
                            {share.medical_files?.study_date && (
                              <>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    share.medical_files.study_date
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {share.reviewed_at ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
