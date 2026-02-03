"use client";

import { MedicalViewer } from "@/components/viewer/medical-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ViewerClientProps {
  images: string[];
  studyInfo?: {
    patientName?: string;
    studyDate?: string;
    modality?: string;
  };
  studyId: string;
}

export function ViewerClient({ images, studyInfo, studyId }: ViewerClientProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-semibold mb-2">No Images Available</h2>
        <p className="text-muted-foreground mb-4">
          This study doesn&apos;t have any viewable images.
        </p>
        <Link href="/provider/studies">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Studies
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/provider/studies">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Studies
          </Button>
        </Link>
        {studyInfo && (
          <div className="text-sm text-muted-foreground">
            {studyInfo.patientName} {studyInfo.modality && `• ${studyInfo.modality}`} {studyInfo.studyDate && `• ${studyInfo.studyDate}`}
          </div>
        )}
      </div>

      <MedicalViewer images={images} studyInfo={studyInfo} />
    </div>
  );
}
