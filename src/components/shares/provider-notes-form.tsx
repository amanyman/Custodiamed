"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProviderNotesFormProps {
  shareId: string;
  initialNotes: string | null;
  isReviewed: boolean;
}

export function ProviderNotesForm({
  shareId,
  initialNotes,
  isReviewed,
}: ProviderNotesFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false);

  const handleSaveNotes = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("file_shares")
      .update({ provider_notes: notes })
      .eq("id", shareId);

    if (error) {
      toast.error("Failed to save notes");
      setIsLoading(false);
      return;
    }

    toast.success("Notes saved");
    setIsLoading(false);
    router.refresh();
  };

  const handleMarkReviewed = async () => {
    setIsMarkingReviewed(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("file_shares")
      .update({
        reviewed_at: new Date().toISOString(),
        provider_notes: notes,
      })
      .eq("id", shareId);

    if (error) {
      toast.error("Failed to mark as reviewed");
      setIsMarkingReviewed(false);
      return;
    }

    await createAuditLog({
      action: "share.view",
      resourceType: "file_share",
      resourceId: shareId,
      details: { action: "marked_reviewed" },
    });

    toast.success("Marked as reviewed");
    setIsMarkingReviewed(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add your clinical notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[120px]"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleSaveNotes}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Notes
        </Button>
        {!isReviewed && (
          <Button
            onClick={handleMarkReviewed}
            disabled={isMarkingReviewed}
            className="gap-2"
          >
            {isMarkingReviewed ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Mark as Reviewed
          </Button>
        )}
        {isReviewed && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Reviewed</span>
          </div>
        )}
      </div>
    </div>
  );
}
