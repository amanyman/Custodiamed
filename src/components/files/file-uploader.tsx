"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileImage, Loader2, CheckCircle, CloudUpload, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadedFile {
  file: FileWithPreview;
  progress: number;
  status: "pending" | "uploading" | "success" | "error" | "skipped";
  error?: string;
}

// Files to skip (not medical files)
const SKIP_EXTENSIONS = ['.bat', '.exe', '.dll', '.ini', '.txt', '.log', '.xml', '.html', '.htm', '.css', '.js', '.json', '.md', '.pdf', '.doc', '.docx'];
const SKIP_FILENAMES = ['run.bat', 'autorun.inf', 'desktop.ini', 'thumbs.db', '.ds_store'];

// Check if file is likely a DICOM file
function isDicomFile(file: File): boolean {
  const name = file.name.toLowerCase();
  // Explicit DICOM extension
  if (name.endsWith('.dcm') || name.endsWith('.dicom')) return true;
  // DICOM files often have no extension or numeric names
  if (!name.includes('.') || /^\d+$/.test(name.split('/').pop() || '')) return true;
  // Check for common DICOM filename patterns
  if (/^[a-z]{2}\d+$/i.test(name) || /^im\d+$/i.test(name) || /^mr\d+$/i.test(name) || /^ct\d+$/i.test(name)) return true;
  return false;
}

// Check if file is an image
function isImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || file.type.startsWith('image/');
}

// Check if file should be skipped
function shouldSkipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (SKIP_FILENAMES.includes(name)) return true;
  for (const ext of SKIP_EXTENSIONS) {
    if (name.endsWith(ext)) return true;
  }
  return false;
}

// Check if file is a valid medical file
function isMedicalFile(file: File): boolean {
  if (shouldSkipFile(file)) return false;
  return isDicomFile(file) || isImageFile(file);
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB for DICOM folders

export function FileUploader({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    let skipped = 0;
    const medicalFiles: UploadedFile[] = [];

    acceptedFiles.forEach((file) => {
      if (isMedicalFile(file)) {
        medicalFiles.push({
          file: Object.assign(file, {
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          }),
          progress: 0,
          status: "pending",
        });
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
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.file.preview) {
        URL.revokeObjectURL(file.file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setOverallProgress(0);
    const supabase = createClient();
    const totalFiles = files.filter(f => f.status !== "success").length;
    let completedFiles = 0;

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      if (uploadedFile.status === "success") continue;

      // Update status to uploading
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: "uploading", progress: 0 };
        return newFiles;
      });

      try {
        // Generate unique file path
        const fileExt = uploadedFile.file.name.includes('.')
          ? uploadedFile.file.name.split(".").pop()
          : 'dcm'; // Default to dcm for DICOM files without extension
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${patientId}/${fileName}`;

        // Upload to Supabase Storage with progress tracking
        const { error: uploadError } = await supabase.storage
          .from("medical-files")
          .upload(filePath, uploadedFile.file, {
            cacheControl: "3600",
            upsert: false,
          });

        // Simulate progress updates (Supabase doesn't provide real progress)
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress: 50 };
          return newFiles;
        });

        if (uploadError) throw uploadError;

        // Determine file type
        const fileType = isDicomFile(uploadedFile.file)
          ? "dicom"
          : uploadedFile.file.type.startsWith("image/")
            ? "image"
            : "other";

        // Create database record
        const { data: fileRecord, error: dbError } = await supabase
          .from("medical_files")
          .insert({
            patient_id: patientId,
            original_filename: uploadedFile.file.name,
            file_type: fileType,
            file_size: uploadedFile.file.size,
            storage_path: filePath,
            mime_type: uploadedFile.file.type || "application/dicom",
            description: description || null,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Create audit log
        await createAuditLog({
          action: "file.upload",
          resourceType: "medical_file",
          resourceId: fileRecord.id,
          details: {
            filename: uploadedFile.file.name,
            fileSize: uploadedFile.file.size,
            fileType,
          },
        });

        completedFiles++;
        setOverallProgress(Math.round((completedFiles / totalFiles) * 100));

        // Update status to success
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: "success", progress: 100 };
          return newFiles;
        });
      } catch (error) {
        console.error("Upload error:", error);
        completedFiles++;
        setOverallProgress(Math.round((completedFiles / totalFiles) * 100));

        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = {
            ...newFiles[i],
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          };
          return newFiles;
        });
        toast.error(`Failed to upload ${uploadedFile.file.name}`);
      }
    }

    setIsUploading(false);

    // Count successes
    const successCount = files.filter(f => f.status === "success").length;
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
      router.push("/patient/files");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
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

        {/* Animated icon */}
        <div className={cn(
          "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
          isDragActive
            ? "bg-primary/20 scale-110"
            : "bg-primary/10 group-hover:bg-primary/15 group-hover:scale-105"
        )}>
          <CloudUpload className={cn(
            "h-10 w-10 transition-colors",
            isDragActive ? "text-primary" : "text-primary/70 group-hover:text-primary"
          )} />
        </div>

        <p className="text-xl font-semibold">
          {isDragActive ? "Drop your files here" : "Drag & drop your files"}
        </p>
        <p className="mt-2 text-muted-foreground">
          or <span className="text-primary font-medium">browse</span> to choose files
        </p>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/50" />
            DICOM files
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/50" />
            JPEG, PNG
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/50" />
            Folders supported
          </span>
        </div>

        {/* Decorative gradient */}
        {isDragActive && (
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 animate-pulse" />
        )}
      </div>

      {/* Skipped files notice */}
      {skippedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-4 animate-fade-in-up">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {skippedCount} non-medical file{skippedCount > 1 ? 's were' : ' was'} automatically skipped (e.g., .bat, .exe, .txt files)
          </p>
        </div>
      )}

      {/* Overall Progress */}
      {isUploading && (
        <div className="space-y-2 animate-fade-in-up">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Uploading files...</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Medical Files ({files.length})</h3>
          </div>
          <div className="space-y-3">
            {files.map((uploadedFile, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-soft transition-all hover:shadow-soft-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Preview */}
                  {uploadedFile.file.preview ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                      <img
                        src={uploadedFile.file.preview}
                        alt={uploadedFile.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl feature-icon">
                      <FileImage className="h-7 w-7 text-primary" />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadedFile.status === "uploading" && (
                      <Progress value={50} className="mt-2 h-1.5" />
                    )}
                    {uploadedFile.status === "error" && (
                      <p className="text-xs text-destructive mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === "uploading" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                    {uploadedFile.status === "success" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {uploadedFile.status !== "uploading" &&
                      uploadedFile.status !== "success" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-medium">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Add notes about these files, e.g., 'MRI scan from January visit'..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none rounded-xl border-2 focus:border-primary/50"
        />
      </div>

      {/* Upload Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            files.forEach((f) => {
              if (f.file.preview) URL.revokeObjectURL(f.file.preview);
            });
            setFiles([]);
            setDescription("");
          }}
          disabled={isUploading || files.length === 0}
          className="h-12 px-6 font-medium border-2"
        >
          Clear All
        </Button>
        <Button
          onClick={uploadFiles}
          disabled={isUploading || files.length === 0}
          className="h-12 px-8 font-medium btn-glow shadow-lg shadow-primary/25"
        >
          {isUploading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          <Upload className="mr-2 h-5 w-5" />
          Upload {files.length > 0 && `(${files.length})`}
        </Button>
      </div>
    </div>
  );
}
