"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DownloadStudyButtonProps {
  studyId: string;
  studyName: string;
}

export function DownloadStudyButton({ studyId, studyName }: DownloadStudyButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const supabase = createClient();

    try {
      // Get all files for this study
      const { data: files } = await supabase
        .from("medical_files")
        .select("id, original_filename, storage_path")
        .eq("study_id", studyId);

      if (!files || files.length === 0) {
        toast.error("No files found in this study");
        return;
      }

      // Download each file
      let downloadCount = 0;
      for (const file of files) {
        const { data: signedUrl } = await supabase.storage
          .from("medical-files")
          .createSignedUrl(file.storage_path, 300);

        if (signedUrl?.signedUrl) {
          const link = document.createElement("a");
          link.href = signedUrl.signedUrl;
          link.download = file.original_filename;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloadCount++;
          // Small delay between downloads to prevent browser blocking
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (downloadCount > 0) {
        toast.success(`Downloaded ${downloadCount} file${downloadCount > 1 ? "s" : ""}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download files");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download All
        </>
      )}
    </Button>
  );
}
