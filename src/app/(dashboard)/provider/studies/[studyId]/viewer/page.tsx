import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ViewerClient } from "./viewer-client";

interface ViewerPageProps {
  params: Promise<{ studyId: string }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { studyId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get provider
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
    redirect("/login");
  }

  // Get the file share and related files
  // First try to find by share ID, then by study_id
  let files: any[] = [];
  let studyInfo: any = null;
  let patientName = "Unknown Patient";

  // Try to get share by ID
  const { data: share } = await supabase
    .from("file_shares")
    .select(`
      id,
      medical_files(
        id,
        original_filename,
        storage_path,
        file_type,
        modality,
        study_date,
        study_id
      ),
      patients(
        profiles(full_name)
      )
    `)
    .eq("id", studyId)
    .eq("provider_id", provider.id)
    .single();

  if (share) {
    // Single file share - cast relations to any for type safety
    const patients = share.patients as any;
    const file = share.medical_files as any;
    patientName = patients?.profiles?.full_name || "Unknown Patient";
    if (file) {
      studyInfo = {
        patientName,
        studyDate: file.study_date ? new Date(file.study_date).toLocaleDateString() : undefined,
        modality: file.modality,
      };

      // If the file has a study_id, get all files in that study
      if (file.study_id) {
        const { data: studyFiles } = await supabase
          .from("medical_files")
          .select("id, original_filename, storage_path, file_type")
          .eq("study_id", file.study_id)
          .order("original_filename");

        files = studyFiles || [file];
      } else {
        files = [file];
      }
    }
  } else {
    // Try to find by study_id
    const { data: studyFiles } = await supabase
      .from("medical_files")
      .select(`
        id,
        original_filename,
        storage_path,
        file_type,
        modality,
        study_date,
        patient_id,
        patients(profiles(full_name))
      `)
      .eq("study_id", studyId);

    if (studyFiles && studyFiles.length > 0) {
      files = studyFiles;
      const firstFile = studyFiles[0] as any;
      patientName = firstFile.patients?.profiles?.full_name || "Unknown Patient";
      studyInfo = {
        patientName,
        studyDate: firstFile.study_date
          ? new Date(firstFile.study_date).toLocaleDateString()
          : undefined,
        modality: firstFile.modality,
      };
    }
  }

  // Get signed URLs for all files in bulk
  const storagePaths = files
    .filter(file => file.storage_path)
    .map(file => file.storage_path);

  let imageUrls: string[] = [];
  if (storagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("medical-files")
      .createSignedUrls(storagePaths, 3600); // 1 hour expiry

    if (signedUrls) {
      imageUrls = signedUrls
        .filter(item => item.signedUrl)
        .map(item => item.signedUrl);
    }
  }

  // Mark as reviewed
  if (share) {
    await supabase
      .from("file_shares")
      .update({ reviewed_at: new Date().toISOString() })
      .eq("id", studyId)
      .eq("provider_id", provider.id);
  }

  return <ViewerClient images={imageUrls} studyInfo={studyInfo} studyId={studyId} />;
}
