import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, User, Calendar, FileText, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface StudyDetailPageProps {
  params: Promise<{ studyId: string }>;
}

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { studyId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get provider
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!provider) {
    redirect("/provider");
  }

  // Get the file share
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
        modality,
        study_date,
        study_id,
        dicom_metadata
      ),
      patients(
        id,
        profiles(full_name, email)
      )
    `)
    .eq("id", studyId)
    .eq("provider_id", provider.id)
    .single();

  if (!share) {
    redirect("/provider/studies");
  }

  // Handle the relation (could be object or array depending on Supabase types)
  const file = share.medical_files as any;
  const patient = share.patients as any;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/provider/studies">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Studies
          </Button>
        </Link>
        <Link href={`/provider/studies/${studyId}/viewer`}>
          <Button className="gap-2">
            <Eye className="h-4 w-4" />
            Open Viewer
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold">{file?.modality || "Medical Study"}</h2>
        <p className="text-muted-foreground mt-1">
          Shared by {patient?.profiles?.full_name || "Unknown Patient"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Study Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Study Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">File Name</p>
                <p className="font-medium">{file?.original_filename || "Unknown"}</p>
              </div>
            </div>

            {file?.modality && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-5 w-5 flex items-center justify-center text-muted-foreground text-xs font-bold">
                  M
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modality</p>
                  <p className="font-medium">{file.modality}</p>
                </div>
              </div>
            )}

            {file?.study_date && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Study Date</p>
                  <p className="font-medium">
                    {new Date(file.study_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-5 w-5 flex items-center justify-center text-muted-foreground text-xs font-bold">
                T
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File Type</p>
                <p className="font-medium">{file?.file_type || "Unknown"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient & Share Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient & Share Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-medium">{patient?.profiles?.full_name || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Shared On</p>
                <p className="font-medium">
                  {new Date(share.created_at).toLocaleDateString()} at{" "}
                  {new Date(share.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className={`h-5 w-5 ${share.reviewed_at ? "text-green-500" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Review Status</p>
                <p className="font-medium">
                  {share.reviewed_at ? (
                    <span className="text-green-500">
                      Reviewed on {new Date(share.reviewed_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-yellow-500">Pending Review</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DICOM Metadata (if available) */}
      {file?.dicom_metadata && Object.keys(file.dicom_metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>DICOM Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              {Object.entries(file.dicom_metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
