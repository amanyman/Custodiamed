import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, FolderOpen, Calendar, HardDrive, Eye, Trash2, MoreVertical, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteAllButton } from "@/components/files/delete-all-button";
import { StudyFilters } from "@/components/files/study-filters";

interface FilesPageProps {
  searchParams: Promise<{ search?: string; modality?: string; sort?: string }>;
}

export default async function ProviderFilesPage({ searchParams }: FilesPageProps) {
  const params = await searchParams;
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

  // Build study query with filters
  let studyQuery = supabase
    .from("imaging_studies")
    .select("*")
    .eq("provider_id", provider.id);

  // Apply modality filter
  if (params.modality && params.modality !== "all") {
    studyQuery = studyQuery.eq("modality", params.modality);
  }

  // Apply search filter
  if (params.search) {
    studyQuery = studyQuery.or(
      `modality.ilike.%${params.search}%,study_type.ilike.%${params.search}%,description.ilike.%${params.search}%,facility_name.ilike.%${params.search}%`
    );
  }

  // Apply sorting
  const sort = params.sort || "date-desc";
  switch (sort) {
    case "date-asc":
      studyQuery = studyQuery.order("study_date", { ascending: true });
      break;
    case "size-desc":
      studyQuery = studyQuery.order("total_size", { ascending: false });
      break;
    case "size-asc":
      studyQuery = studyQuery.order("total_size", { ascending: true });
      break;
    default:
      studyQuery = studyQuery.order("study_date", { ascending: false });
  }

  const { data: studies } = await studyQuery;

  const hasStudies = studies && studies.length > 0;
  const studyCount = studies?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Files</h2>
          <p className="text-muted-foreground">
            Manage your uploaded medical imaging studies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DeleteAllButton
            ownerId={provider.id}
            ownerType="provider"
            studyCount={studyCount}
            fileCount={0}
          />
          <Link href="/provider/files/upload">
            <Button className="gap-2 btn-glow shadow-lg shadow-primary/25">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <StudyFilters />

      {!hasStudies ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <FileImage className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {params.search || params.modality ? "No matching studies" : "No files yet"}
            </h3>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              {params.search || params.modality
                ? "Try adjusting your search or filters"
                : "Upload medical imaging files to your library to get started"
              }
            </p>
            {!params.search && !params.modality && (
              <Link href="/provider/files/upload" className="mt-6">
                <Button size="lg" className="btn-glow shadow-lg shadow-primary/25">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Your First Study
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <Card key={study.id} className="overflow-hidden border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
              <Link href={`/provider/files/study/${study.id}`}>
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
                    <Link href={`/provider/files/study/${study.id}`} className="flex-1">
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
                          <Link href={`/provider/files/study/${study.id}`}>
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View Files
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
                    <Link href={`/provider/files/study/${study.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Eye className="h-4 w-4" />
                        Open Viewer
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
