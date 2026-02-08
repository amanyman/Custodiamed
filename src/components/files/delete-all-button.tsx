"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DeleteAllButtonProps {
  ownerId: string;
  ownerType: "patient" | "provider";
  studyCount: number;
  fileCount: number;
}

export function DeleteAllButton({ ownerId, ownerType, studyCount, fileCount }: DeleteAllButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const ownerColumn = ownerType === "patient" ? "patient_id" : "provider_id";

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    try {
      // Get all studies for this owner
      const { data: studies } = await supabase
        .from("imaging_studies")
        .select("id")
        .eq(ownerColumn, ownerId);

      // Get all files for this owner
      const { data: files } = await supabase
        .from("medical_files")
        .select("id, storage_path")
        .eq(ownerColumn, ownerId);

      // Delete files from storage
      if (files && files.length > 0) {
        const storagePaths = files.map(f => f.storage_path).filter(Boolean);
        if (storagePaths.length > 0) {
          await supabase.storage.from("medical-files").remove(storagePaths);
        }
      }

      // Delete all medical files records
      await supabase
        .from("medical_files")
        .delete()
        .eq(ownerColumn, ownerId);

      // Delete all provider invitations for studies (patient only)
      if (ownerType === "patient" && studies && studies.length > 0) {
        const studyIds = studies.map(s => s.id);
        await supabase
          .from("provider_invitations")
          .delete()
          .in("study_id", studyIds);
      }

      // Delete all imaging studies
      await supabase
        .from("imaging_studies")
        .delete()
        .eq(ownerColumn, ownerId);

      toast.success("All files deleted successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error("Failed to delete files");
    } finally {
      setIsDeleting(false);
    }
  };

  if (studyCount === 0 && fileCount === 0) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
          Delete All Files
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all files?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {studyCount > 0 ? `${studyCount} ${studyCount === 1 ? 'study' : 'studies'}` : ''}
            {studyCount > 0 && fileCount > 0 ? ' and ' : ''}
            {fileCount > 0 ? `${fileCount} ${fileCount === 1 ? 'file' : 'files'}` : ''}.
            This action cannot be undone.{ownerType === "patient" && " All shared links will also stop working."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete All"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
