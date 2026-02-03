"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Provider {
  id: string;
  practice_name: string;
  specialty: string;
  profiles: {
    full_name: string;
  };
}

interface ShareFileFormProps {
  fileId: string;
  patientId: string;
  providers: Provider[];
}

export function ShareFileForm({
  fileId,
  patientId,
  providers,
}: ShareFileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

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

    // Create or reactivate share
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

    const provider = providers.find((p) => p.id === selectedProvider);
    toast.success(`File shared with ${provider?.profiles.full_name}`);
    setSelectedProvider("");
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Provider</Label>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a provider to share with" />
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

      <Button
        onClick={handleShare}
        disabled={isLoading || !selectedProvider}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share File
      </Button>
    </div>
  );
}
