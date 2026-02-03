import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileUploader } from "@/components/files/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UploadPage() {
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Upload Files</h2>
        <p className="text-muted-foreground">
          Upload your medical imaging files to share with healthcare providers
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
          <FileUploader patientId={patient.id} />
        </CardContent>
      </Card>
    </div>
  );
}
