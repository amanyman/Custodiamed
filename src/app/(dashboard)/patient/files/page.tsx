import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, FolderOpen, Calendar, HardDrive, Share2, Trash2, MoreVertical, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function FilesPage() {
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

  // Run queries in parallel for faster loading
  const [studiesResult, legacyFilesResult] = await Promise.all([
    supabase
      .from("imaging_studies")
      .select("*")
      .eq("patient_id", patient.id)
      .order("study_date", { ascending: false }),
    supabase
      .from("medical_files")
      .select("*")
      .eq("patient_id", patient.id)
      .is("study_id", null)
      .order("created_at", { ascending: false }),
  ]);

  const studies = studiesResult.data;
  const legacyFiles = legacyFilesResult.data;

  const hasStudies = studies && studies.length > 0;
  const hasLegacyFiles = legacyFiles && legacyFiles.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Files</h2>
          <p className="text-muted-foreground">
            Manage your medical imaging studies
          </p>
        </div>
        <Link href="/patient/files/upload">
          <Button className="gap-2 btn-glow shadow-lg shadow-primary/25">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </Link>
      </div>

      {!hasStudies && !hasLegacyFiles ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <FileImage className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No files yet</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              Upload your medical imaging files from CDs or your device to get started
            </p>
            <Link href="/patient/files/upload" className="mt-6">
              <Button size="lg" className="btn-glow shadow-lg shadow-primary/25">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your First Study
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Imaging Studies */}
          {hasStudies && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studies.map((study) => (
                <Card key={study.id} className="overflow-hidden border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
                  <Link href={`/patient/files/study/${study.id}`}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative cursor-pointer">
                      <FolderOpen className="h-16 w-16 text-primary/50 group-hover:scale-110 transition-transform" />
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        {study.file_count} files
                      </Badge>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <Link href={`/patient/files/study/${study.id}`} className="flex-1">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {study.study_type || study.modality}
                          </h3>
                          {study.study_type && (
                            <p className="text-sm text-muted-foreground">{study.modality}</p>
                          )}
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/patient/files/study/${study.id}`}>
                                <FolderOpen className="mr-2 h-4 w-4" />
                                View Files
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/patient/files/study/${study.id}/share`}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Study
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Study
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {study.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {study.description}
                        </p>
                      )}
                      {study.facility_name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {study.facility_name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(study.study_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {(study.total_size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/patient/files/study/${study.id}/share`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Legacy Files (without study) */}
          {hasLegacyFiles && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Other Files ({legacyFiles.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {legacyFiles.slice(0, 12).map((file) => (
                  <Link key={file.id} href={`/patient/files/${file.id}`}>
                    <Card className="overflow-hidden border-0 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <FileImage className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="truncate font-medium text-sm">
                          {file.original_filename}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {file.file_type}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {legacyFiles.length > 12 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {legacyFiles.length - 12} more files...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
