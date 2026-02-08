import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getUser, getProvider } from "@/lib/supabase/cached";
import { ViewerClient } from "./viewer-client";

interface ViewerPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderFileViewerPage({ params }: ViewerPageProps) {
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
    .select("id, original_filename, storage_path, file_type")
    .eq("study_id", id)
    .order("original_filename");

  const studyInfo = {
    studyDate: study.study_date
      ? new Date(study.study_date).toLocaleDateString()
      : undefined,
    modality: study.modality,
  };

  // Get signed URLs for all files
  const storagePaths = (files || [])
    .filter(file => file.storage_path)
    .map(file => file.storage_path);

  let imageUrls: string[] = [];
  if (storagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("medical-files")
      .createSignedUrls(storagePaths, 3600);

    if (signedUrls) {
      imageUrls = signedUrls
        .filter(item => item.signedUrl)
        .map(item => item.signedUrl);
    }
  }

  return <ViewerClient images={imageUrls} studyInfo={studyInfo} studyId={id} />;
}
