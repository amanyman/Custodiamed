import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileImage, Users, CheckCircle, XCircle } from "lucide-react";
import { ShareFileForm } from "@/components/shares/share-file-form";

export default async function ShareFilePage({
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

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    redirect("/login");
  }

  // Get file details
  const { data: file } = await supabase
    .from("medical_files")
    .select(`
      id,
      original_filename,
      file_type,
      modality,
      file_shares(
        id,
        status,
        created_at,
        providers(
          id,
          practice_name,
          profiles(full_name)
        )
      )
    `)
    .eq("id", id)
    .eq("patient_id", patient.id)
    .single();

  if (!file) {
    notFound();
  }

  // Get connected providers
  const { data: relationships } = await supabase
    .from("patient_provider_relationships")
    .select(`
      providers(
        id,
        practice_name,
        specialty,
        profiles(full_name)
      )
    `)
    .eq("patient_id", patient.id)
    .eq("status", "active");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers = (relationships?.map((r) => r.providers).filter(Boolean) || []) as any[];

  // Get already shared provider IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedProviderIds = (file.file_shares as any[])
      ?.filter((s) => s.status === "active")
      .map((s) => s.providers?.id)
      .filter(Boolean) || [];

  // Available providers (not already shared with)
  const availableProviders = providers.filter(
    (p) => p && !sharedProviderIds.includes(p.id)
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patient/files/${file.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Share File</h2>
          <p className="text-muted-foreground">
            Share this file with your healthcare providers
          </p>
        </div>
      </div>

      {/* File Info */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <FileImage className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{file.original_filename}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{file.file_type}</Badge>
              {file.modality && (
                <Badge variant="outline">{file.modality}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share with Provider</CardTitle>
          <CardDescription>
            Select a provider to share this file with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No connected providers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You need to connect with a provider before you can share files.
                Ask your healthcare provider to send you an invitation.
              </p>
              <Link href="/patient/providers" className="mt-4">
                <Button variant="outline">View Providers</Button>
              </Link>
            </div>
          ) : availableProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 font-semibold">
                Already shared with all providers
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This file has been shared with all your connected providers.
              </p>
            </div>
          ) : (
            <ShareFileForm
              fileId={file.id}
              patientId={patient.id}
              providers={availableProviders as Array<{
                id: string;
                practice_name: string;
                specialty: string;
                profiles: { full_name: string };
              }>}
            />
          )}
        </CardContent>
      </Card>

      {/* Current Shares */}
      {file.file_shares && file.file_shares.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Shared With</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(file.file_shares as any[]).map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {share.providers?.profiles?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {share.providers?.practice_name}
                    </p>
                  </div>
                  {share.status === "active" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="mr-1 h-3 w-3" />
                      Revoked
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
