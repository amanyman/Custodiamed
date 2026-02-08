import { redirect } from "next/navigation";
import { getUser, getPatient } from "@/lib/supabase/cached";
import { FileUploader } from "@/components/files/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UploadPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const patient = await getPatient(user.id);
  if (!patient) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Upload Files</h2>
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
          <FileUploader uploaderType="patient" ownerId={patient.id} />
        </CardContent>
      </Card>
    </div>
  );
}
