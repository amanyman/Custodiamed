import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar, Eye, Clock } from "lucide-react";
import Link from "next/link";

export default async function SharedStudiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get provider record
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    redirect("/login");
  }

  // Expire old shares before querying
  try {
    await supabase.rpc("expire_old_shares");
  } catch {
    // Function may not exist yet - that's ok
  }

  // Get all shared studies (exclude expired)
  const { data: shares } = await supabase
    .from("file_shares")
    .select(`
      id,
      status,
      created_at,
      reviewed_at,
      expires_at,
      medical_files(
        id,
        original_filename,
        file_type,
        study_date,
        modality,
        study_id
      ),
      patients(
        id,
        profiles(full_name, email)
      )
    `)
    .eq("provider_id", provider.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Group shares by study
  const studyGroups = new Map();
  shares?.forEach((share: any) => {
    const studyId = share.medical_files?.study_id || share.id;
    if (!studyGroups.has(studyId)) {
      studyGroups.set(studyId, {
        studyId,
        patientName: share.patients?.profiles?.full_name || "Unknown Patient",
        patientEmail: share.patients?.profiles?.email,
        studyDate: share.medical_files?.study_date,
        modality: share.medical_files?.modality,
        files: [],
        createdAt: share.created_at,
        reviewed: share.reviewed_at !== null,
      });
    }
    studyGroups.get(studyId).files.push(share);
  });

  const studies = Array.from(studyGroups.values());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Shared Studies</h2>
        <p className="text-muted-foreground mt-1">
          Medical imaging studies shared with you by patients
        </p>
      </div>

      {studies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Studies Yet</h3>
            <p className="text-muted-foreground mb-4">
              When patients share their medical imaging with you, it will appear here.
            </p>
            <Link href="/provider/invite">
              <Button>Invite a Patient</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {studies.map((study) => (
            <Card key={study.studyId} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Study Preview Thumbnail */}
                  <div className="bg-muted/50 p-6 flex items-center justify-center md:w-40">
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Study Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {study.modality || "Medical Study"} - {study.files.length} file{study.files.length !== 1 ? "s" : ""}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {study.patientName}
                          </span>
                          {study.studyDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              Study: {new Date(study.studyDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            Received: {new Date(study.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Review Status */}
                      <div className="flex items-center gap-3">
                        {study.reviewed ? (
                          <span className="text-sm text-green-500 flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            Reviewed
                          </span>
                        ) : (
                          <span className="text-sm text-yellow-500 flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      <Link href={`/provider/studies/${study.studyId}/viewer`}>
                        <Button className="gap-2">
                          <Eye className="h-4 w-4" />
                          Open Viewer
                        </Button>
                      </Link>
                      <Link href={`/provider/studies/${study.studyId}`}>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
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
