"use client";

import { FileImage } from "lucide-react";

interface FileViewerProps {
  fileUrl?: string;
  fileType: string;
  fileName: string;
}

export function FileViewer({ fileUrl, fileType, fileName }: FileViewerProps) {
  if (!fileUrl) {
    return (
      <div className="flex aspect-video items-center justify-center bg-muted">
        <div className="text-center">
          <FileImage className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Unable to load file</p>
        </div>
      </div>
    );
  }

  // For images (jpg, png)
  if (fileType === "image" || fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return (
      <div className="flex items-center justify-center bg-black p-4">
        <img
          src={fileUrl}
          alt={fileName}
          className="max-h-[600px] object-contain"
        />
      </div>
    );
  }

  // For DICOM files (basic display - full viewer would require specialized library)
  if (fileType === "dicom" || fileName.match(/\.dcm$/i)) {
    return (
      <div className="flex aspect-video items-center justify-center bg-muted">
        <div className="text-center">
          <FileImage className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 font-medium">DICOM File</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Full DICOM viewer coming soon. Download to view in a DICOM viewer.
          </p>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="flex aspect-video items-center justify-center bg-muted">
      <div className="text-center">
        <FileImage className="mx-auto h-16 w-16 text-muted-foreground" />
        <p className="mt-4 font-medium">{fileName}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Preview not available. Download to view.
        </p>
      </div>
    </div>
  );
}
