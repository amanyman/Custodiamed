import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileUploader } from "@/components/files/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProviderUploadPage() {
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Files</h2>
        <p className="text-muted-foreground">
          Upload medical imaging files to your library
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Files</CardTitle>
          <CardDescription>
            Upload DICOM files from CDs or images from your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader uploaderType="provider" ownerId={provider.id} />
        </CardContent>
      </Card>
    </div>
  );
}
