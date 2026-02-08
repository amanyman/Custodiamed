import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProvider } from "@/lib/supabase/cached";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileImage,
  Calendar,
  HardDrive,
  Trash2
} from "lucide-react";
import { DownloadStudyButton } from "@/components/files/download-study-button";

export default async function ProviderStudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const provider = await getProvider(user.id);
  if (!provider) redirect("/login");

  // Get study - secured by provider_id
  const supabase = await createClient();
  const { data: study } = await supabase
    .from("imaging_studies")
    .select("*")
    .eq("id", id)
    .eq("provider_id", provider.id)
    .single();

  if (!study) {
    notFound();
  }

  // Get files for this study
  const { data: files } = await supabase
    .from("medical_files")
    .select("*")
    .eq("study_id", id)
    .order("original_filename", { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/provider/files">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{study.modality} Study</h2>
          {study.description && (
            <p className="text-muted-foreground">{study.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <DownloadStudyButton studyId={id} studyName={study.modality} />
        </div>
      </div>

      {/* Study Info */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Date</p>
                <p className="font-medium">
                  {new Date(study.study_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileImage className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="font-medium">{study.file_count} files</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="font-medium">
                  {(study.total_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploaded</p>
                <p className="font-medium">
                  {new Date(study.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Files in this study</h3>
          <p className="text-sm text-muted-foreground">
            {files?.length || 0} files
          </p>
        </div>

        {files && files.length > 0 ? (
          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-medium">Filename</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Size</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr
                      key={file.id}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileImage className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[300px]">
                            {file.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{file.file_type}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {(file.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/provider/files/study/${id}/viewer`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-12 text-center">
              <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files found in this study</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete Study
        </Button>
      </div>
    </div>
  );
}
