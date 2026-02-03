"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileImage, Loader2, CheckCircle, CloudUpload, AlertCircle, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

// Files to skip (not medical files)
const SKIP_EXTENSIONS = ['.bat', '.exe', '.dll', '.ini', '.txt', '.log', '.xml', '.html', '.htm', '.css', '.js', '.json', '.md', '.pdf', '.doc', '.docx'];
const SKIP_FILENAMES = ['run.bat', 'autorun.inf', 'desktop.ini', 'thumbs.db', '.ds_store'];

const MODALITY_OPTIONS = [
  { value: "MRI", label: "MRI (Magnetic Resonance)" },
  { value: "CT", label: "CT Scan" },
  { value: "X-Ray", label: "X-Ray" },
  { value: "Ultrasound", label: "Ultrasound" },
  { value: "PET", label: "PET Scan" },
  { value: "Mammogram", label: "Mammogram" },
  { value: "Other", label: "Other" },
];

const MRI_TYPES = [
  "Brain MRI",
  "Spine MRI",
  "Lumbar MRI",
  "Cervical MRI",
  "Thoracic MRI",
  "Knee MRI",
  "Shoulder MRI",
  "Hip MRI",
  "Ankle MRI",
  "Wrist MRI",
  "Abdominal MRI",
  "Pelvic MRI",
  "Cardiac MRI",
  "Breast MRI",
  "Other",
];

function isDicomFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.dcm') || name.endsWith('.dicom')) return true;
  if (!name.includes('.') || /^\d+$/.test(name.split('/').pop() || '')) return true;
  if (/^[a-z]{2}\d+$/i.test(name) || /^im\d+$/i.test(name) || /^mr\d+$/i.test(name) || /^ct\d+$/i.test(name)) return true;
  return false;
}

function isImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || file.type.startsWith('image/');
}

function shouldSkipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (SKIP_FILENAMES.includes(name)) return true;
  for (const ext of SKIP_EXTENSIONS) {
    if (name.endsWith(ext)) return true;
  }
  return false;
}

function isMedicalFile(file: File): boolean {
  if (shouldSkipFile(file)) return false;
  return isDicomFile(file) || isImageFile(file);
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}m`;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export function FileUploader({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "files" | "uploading" | "complete">("details");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);

  // Study details
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [modality, setModality] = useState("");
  const [studyType, setStudyType] = useState("");
  const [description, setDescription] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityPhone, setFacilityPhone] = useState("");
  const [facilityEmail, setFacilityEmail] = useState("");

  // Upload progress
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    let skipped = 0;
    const medicalFiles: FileWithPreview[] = [];

    acceptedFiles.forEach((file) => {
      if (isMedicalFile(file)) {
        medicalFiles.push(file);
      } else {
        skipped++;
      }
    });

    if (skipped > 0) {
      setSkippedCount((prev) => prev + skipped);
    }

    if (medicalFiles.length > 0) {
      setFiles((prev) => [...prev, ...medicalFiles]);
      toast.success(`Added ${medicalFiles.length} medical file${medicalFiles.length > 1 ? 's' : ''}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: step === "uploading",
  });

  const uploadFiles = async () => {
    if (files.length === 0 || !modality) {
      toast.error("Please select files and imaging type");
      return;
    }

    setStep("uploading");
    setStartTime(Date.now());
    setUploadedCount(0);
    setUploadedBytes(0);

    const supabase = createClient();

    try {
      // Create study record
      const { data: study, error: studyError } = await supabase
        .from("imaging_studies")
        .insert({
          patient_id: patientId,
          study_date: studyDate,
          modality: modality,
          study_type: studyType || null,
          description: description || null,
          facility_name: facilityName || null,
          facility_phone: facilityPhone || null,
          facility_email: facilityEmail || null,
          file_count: files.length,
          total_size: totalBytes,
        })
        .select()
        .single();

      if (studyError) throw studyError;

      // Upload files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const fileExt = file.name.includes('.') ? file.name.split(".").pop() : 'dcm';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${patientId}/${study.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("medical-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const fileType = isDicomFile(file) ? "dicom" : "image";

        await supabase.from("medical_files").insert({
          patient_id: patientId,
          study_id: study.id,
          original_filename: file.name,
          file_type: fileType,
          file_size: file.size,
          storage_path: filePath,
          mime_type: file.type || "application/dicom",
        });

        // Update progress
        const newUploadedCount = i + 1;
        const newUploadedBytes = uploadedBytes + file.size;
        setUploadedCount(newUploadedCount);
        setUploadedBytes(newUploadedBytes);

        // Calculate time remaining
        const elapsed = (Date.now() - (startTime || Date.now())) / 1000;
        const bytesPerSecond = newUploadedBytes / elapsed;
        const remainingBytes = totalBytes - newUploadedBytes;
        const remainingSeconds = remainingBytes / bytesPerSecond;
        setTimeRemaining(formatTime(remainingSeconds));
      }

      // Auto-share with connected providers
      const { data: relationships } = await supabase
        .from("patient_provider_relationships")
        .select("provider_id")
        .eq("patient_id", patientId)
        .eq("status", "active");

      if (relationships && relationships.length > 0) {
        // Get all the medical files we just created for this study
        const { data: studyFiles } = await supabase
          .from("medical_files")
          .select("id")
          .eq("study_id", study.id);

        if (studyFiles) {
          // Create file shares for each file with each connected provider
          const shareRecords = [];
          for (const rel of relationships) {
            for (const file of studyFiles) {
              shareRecords.push({
                file_id: file.id,
                patient_id: patientId,
                provider_id: rel.provider_id,
              });
            }
          }

          if (shareRecords.length > 0) {
            await supabase.from("file_shares").insert(shareRecords);
          }
        }
      }

      setStep("complete");
      toast.success("Upload complete!");

      setTimeout(() => {
        router.push("/patient/files");
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      setStep("files");
    }
  };

  const progress = files.length > 0 ? Math.round((uploadedCount / files.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Step 1: Study Details */}
      {step === "details" && (
        <Card className="border-0 shadow-soft animate-fade-in-up">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Study Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about this imaging visit</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studyDate">Date of Imaging</Label>
                <Input
                  id="studyDate"
                  type="date"
                  value={studyDate}
                  onChange={(e) => setStudyDate(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Imaging Type</Label>
                <Select value={modality} onValueChange={setModality}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MODALITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {modality === "MRI" && (
              <div className="space-y-2">
                <Label htmlFor="studyType">MRI Type (optional)</Label>
                <Select value={studyType} onValueChange={setStudyType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select MRI type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MRI_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Follow-up scan, Post-surgery check..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-4">Facility Information (optional)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="facilityName">Facility Name</Label>
                  <Input
                    id="facilityName"
                    placeholder="e.g., City Medical Center"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityPhone">Phone Number</Label>
                  <Input
                    id="facilityPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={facilityPhone}
                    onChange={(e) => setFacilityPhone(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityEmail">Email Address</Label>
                  <Input
                    id="facilityEmail"
                    type="email"
                    placeholder="records@facility.com"
                    value={facilityEmail}
                    onChange={(e) => setFacilityEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("files")}
              disabled={!modality}
              className="w-full h-12 font-medium btn-glow shadow-lg shadow-primary/25"
            >
              Continue to Upload Files
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: File Selection */}
      {step === "files" && (
        <>
          {/* Study summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileImage className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{modality} - {new Date(studyDate).toLocaleDateString()}</p>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep("details")}>
              Edit
            </Button>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
              isDragActive ? "bg-primary/20 scale-110" : "bg-primary/10 group-hover:bg-primary/15"
            )}>
              <CloudUpload className={cn(
                "h-10 w-10 transition-colors",
                isDragActive ? "text-primary" : "text-primary/70 group-hover:text-primary"
              )} />
            </div>
            <p className="text-xl font-semibold">
              {isDragActive ? "Drop your files here" : "Drag & drop your CD folder"}
            </p>
            <p className="mt-2 text-muted-foreground">
              or <span className="text-primary font-medium">browse</span> to choose files
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Non-medical files will be automatically skipped
            </p>
          </div>

          {/* Skipped notice */}
          {skippedCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 border p-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {skippedCount} non-medical file{skippedCount > 1 ? 's' : ''} skipped
              </p>
            </div>
          )}

          {/* File summary */}
          {files.length > 0 && (
            <Card className="border-0 shadow-soft">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{files.length} files ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Total size: {(totalBytes / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    setSkippedCount(0);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Upload button */}
          {files.length > 0 && (
            <Button
              onClick={uploadFiles}
              size="lg"
              className="w-full h-14 text-lg font-medium btn-glow shadow-lg shadow-primary/25"
            >
              <Upload className="mr-2 h-6 w-6" />
              Upload {files.length} Files
            </Button>
          )}
        </>
      )}

      {/* Step 3: Uploading */}
      {step === "uploading" && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-8 text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />

            <div>
              <h3 className="font-semibold text-xl">Uploading your {modality} study...</h3>
              <p className="text-muted-foreground mt-2">
                {uploadedCount} of {files.length} files complete
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>

            {timeRemaining && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Estimated time remaining: {timeRemaining}</span>
              </div>
            )}

            <p className="text-primary font-medium pt-4">
              Please don&apos;t leave this page until the upload is complete.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-xl text-green-800">Upload Complete!</h3>
            <p className="text-green-700">
              Successfully uploaded {files.length} files for your {modality} study.
            </p>
            <p className="text-sm text-green-600">Redirecting to your files...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
