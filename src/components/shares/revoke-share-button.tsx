"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RevokeShareButtonProps {
  shareId: string;
}

export function RevokeShareButton({ shareId }: RevokeShareButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRevoke = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("file_shares")
      .update({ status: "revoked" })
      .eq("id", shareId);

    if (error) {
      toast.error("Failed to revoke share");
      setIsLoading(false);
      return;
    }

    await createAuditLog({
      action: "share.revoke",
      resourceType: "file_share",
      resourceId: shareId,
    });

    toast.success("Share revoked successfully");
    setIsOpen(false);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <XCircle className="mr-2 h-4 w-4" />
          Revoke
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this provider&apos;s access to your
            file? They will no longer be able to view it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Revoke Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
