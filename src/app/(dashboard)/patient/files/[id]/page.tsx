import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Download, Trash2, FileImage } from "lucide-react";
import { FileViewer } from "@/components/files/file-viewer";

export default async function FileDetailPage({
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

  const { data: file } = await supabase
    .from("medical_files")
    .select(`
      *,
      file_shares(
        id,
        status,
        created_at,
        reviewed_at,
        provider_notes,
        providers(
          id,
          practice_name,
          specialty,
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

  // Get signed URL for viewing
  const { data: signedUrl } = await supabase.storage
    .from("medical-files")
    .createSignedUrl(file.storage_path, 300); // 5 min expiry

  const activeShares = file.file_shares?.filter(
    (s: { status: string }) => s.status === "active"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient/files">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{file.original_filename}</h2>
          <p className="text-muted-foreground">
            Uploaded {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patient/files/${file.id}/share`}>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </Link>
          {signedUrl?.signedUrl && (
            <a href={signedUrl.signedUrl} download={file.original_filename}>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* File Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <FileViewer
                fileUrl={signedUrl?.signedUrl}
                fileType={file.file_type}
                fileName={file.original_filename}
              />
            </CardContent>
          </Card>
        </div>

        {/* File Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary">{file.file_type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p>{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {file.modality && (
                <div>
                  <p className="text-sm text-muted-foreground">Modality</p>
                  <p>{file.modality}</p>
                </div>
              )}
              {file.study_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Study Date</p>
                  <p>{new Date(file.study_date).toLocaleDateString()}</p>
                </div>
              )}
              {file.body_part && (
                <div>
                  <p className="text-sm text-muted-foreground">Body Part</p>
                  <p>{file.body_part}</p>
                </div>
              )}
              {file.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{file.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Shares */}
          <Card>
            <CardHeader>
              <CardTitle>Shared With</CardTitle>
            </CardHeader>
            <CardContent>
              {activeShares && activeShares.length > 0 ? (
                <div className="space-y-3">
                  {activeShares.map((share: {
                    id: string;
                    reviewed_at: string | null;
                    providers: {
                      practice_name: string;
                      profiles: { full_name: string };
                    };
                  }) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {share.providers.profiles.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {share.providers.practice_name}
                        </p>
                      </div>
                      {share.reviewed_at && (
                        <Badge variant="outline">Reviewed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This file hasn&apos;t been shared yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
