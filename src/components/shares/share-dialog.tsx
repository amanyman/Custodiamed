"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/audit";
import { Share2, Loader2, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  fileId: string;
  patientId: string;
  fileName: string;
}

interface Provider {
  id: string;
  practice_name: string;
  specialty: string;
  profiles: {
    full_name: string;
  };
}

export function ShareDialog({ fileId, patientId, fileName }: ShareDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const supabase = createClient();

      // Get connected providers
      const { data: relationships } = await supabase
        .from("patient_provider_relationships")
        .select(`
          providers(
            id,
            practice_name,
            specialty,
            profiles(full_name)
          )
        `)
        .eq("patient_id", patientId)
        .eq("status", "active");

      if (relationships) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const providersList = (relationships as any[])
          .map((r) => r.providers as Provider)
          .filter(Boolean);
        setProviders(providersList);
      }

      setIsLoadingProviders(false);
    };

    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen, patientId]);

  const handleShare = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    // Check if share already exists
    const { data: existing } = await supabase
      .from("file_shares")
      .select("id, status")
      .eq("file_id", fileId)
      .eq("provider_id", selectedProvider)
      .single();

    if (existing && existing.status === "active") {
      toast.error("This file is already shared with this provider");
      setIsLoading(false);
      return;
    }

    // Create or update share
    if (existing) {
      const { error } = await supabase
        .from("file_shares")
        .update({ status: "active" })
        .eq("id", existing.id);

      if (error) {
        toast.error("Failed to share file");
        setIsLoading(false);
        return;
      }
    } else {
      const { data: share, error } = await supabase
        .from("file_shares")
        .insert({
          file_id: fileId,
          patient_id: patientId,
          provider_id: selectedProvider,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to share file");
        setIsLoading(false);
        return;
      }

      await createAuditLog({
        action: "share.create",
        resourceType: "file_share",
        resourceId: share.id,
        details: {
          fileId,
          providerId: selectedProvider,
        },
      });
    }

    toast.success("File shared successfully");
    setIsOpen(false);
    setIsLoading(false);
    setSelectedProvider("");
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share &quot;{fileName}&quot; with a healthcare provider
          </DialogDescription>
        </DialogHeader>

        {isLoadingProviders ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No connected providers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to connect with a provider before you can share files.
              Ask your healthcare provider to send you an invitation.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Provider</Label>
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex flex-col">
                        <span>{provider.profiles.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.practice_name} • {provider.specialty}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isLoading || !selectedProvider || providers.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Share File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
