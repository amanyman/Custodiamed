import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, MoreVertical, Share2, Trash2, Eye } from "lucide-react";
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

  const { data: files } = await supabase
    .from("medical_files")
    .select(`
      *,
      file_shares(id, status, provider_id)
    `)
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Files</h2>
          <p className="text-muted-foreground">
            Manage your medical imaging files
          </p>
        </div>
        <Link href="/patient/files/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </Link>
      </div>

      {!files || files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileImage className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No files yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Upload your medical imaging files to get started
            </p>
            <Link href="/patient/files/upload" className="mt-4">
              <Button>Upload Your First File</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const activeShares = file.file_shares?.filter(
              (s: { status: string }) => s.status === "active"
            ).length || 0;

            return (
              <Card key={file.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <FileImage className="h-16 w-16 text-muted-foreground" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">
                        {file.original_filename}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">{file.file_type}</Badge>
                        {file.modality && (
                          <Badge variant="outline">{file.modality}</Badge>
                        )}
                        {activeShares > 0 && (
                          <Badge variant="default" className="gap-1">
                            <Share2 className="h-3 w-3" />
                            {activeShares}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/patient/files/${file.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/patient/files/${file.id}/share`}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
