import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, User, Eye, Clock } from "lucide-react";
import { FileViewer } from "@/components/files/file-viewer";
import { ProviderNotesForm } from "@/components/shares/provider-notes-form";

export default async function ReceivedFileDetailPage({
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

  // Get share details
  const { data: share } = await supabase
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
        file_size,
        storage_path,
        modality,
        study_date,
        body_part,
        description
      ),
      patients(
        id,
        date_of_birth,
        profiles(full_name, email)
      )
    `)
    .eq("id", id)
    .eq("provider_id", provider.id)
    .single();

  if (!share || share.status !== "active") {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shareData = share as any;

  // Get signed URL for viewing
  const { data: signedUrl } = await supabase.storage
    .from("medical-files")
    .createSignedUrl(shareData.medical_files?.storage_path || '', 300); // 5 min expiry

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/provider/received">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {shareData.medical_files?.original_filename}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>From {shareData.patients?.profiles?.full_name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {signedUrl?.signedUrl && (
            <a
              href={signedUrl.signedUrl}
              download={shareData.medical_files?.original_filename}
            >
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <FileViewer
                fileUrl={signedUrl?.signedUrl}
                fileType={shareData.medical_files?.file_type || ""}
                fileName={shareData.medical_files?.original_filename || ""}
              />
            </CardContent>
          </Card>

          {/* Notes Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderNotesForm
                shareId={shareData.id}
                initialNotes={shareData.provider_notes}
                isReviewed={!!shareData.reviewed_at}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Details */}
          <Card>
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {shareData.reviewed_at ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Reviewed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary">
                  {shareData.medical_files?.file_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p>
                  {((shareData.medical_files?.file_size || 0) / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </p>
              </div>
              {shareData.medical_files?.modality && (
                <div>
                  <p className="text-sm text-muted-foreground">Modality</p>
                  <p>{shareData.medical_files.modality}</p>
                </div>
              )}
              {shareData.medical_files?.study_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Study Date</p>
                  <p>
                    {new Date(
                      shareData.medical_files.study_date
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {shareData.medical_files?.body_part && (
                <div>
                  <p className="text-sm text-muted-foreground">Body Part</p>
                  <p>{shareData.medical_files.body_part}</p>
                </div>
              )}
              {shareData.medical_files?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{shareData.medical_files.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{shareData.patients?.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{shareData.patients?.profiles?.email}</p>
              </div>
              {shareData.patients?.date_of_birth && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p>
                    {new Date(shareData.patients.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Shared On</p>
                <p>{new Date(shareData.created_at).toLocaleDateString()}</p>
              </div>
              <Link href={`/provider/patients/${shareData.patients?.id}`}>
                <Button variant="outline" className="w-full">
                  View Patient Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
