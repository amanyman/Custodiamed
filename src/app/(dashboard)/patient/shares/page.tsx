import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, FileImage, Eye, XCircle } from "lucide-react";
import { RevokeShareButton } from "@/components/shares/revoke-share-button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function SharesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    redirect("/login");
  }

  const { data: shares } = await supabase
    .from("file_shares")
    .select(`
      id,
      status,
      created_at,
      reviewed_at,
      provider_notes,
      medical_files(
        id,
        original_filename,
        file_type,
        modality
      ),
      providers(
        id,
        practice_name,
        specialty,
        profiles(full_name)
      )
    `)
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeShares = (shares as any[])?.filter((s) => s.status === "active") || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revokedShares = (shares as any[])?.filter((s) => s.status === "revoked") || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Shared Files</h2>
        <p className="text-muted-foreground">
          Manage files you&apos;ve shared with healthcare providers
        </p>
      </div>

      {/* Active Shares */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">
          Active Shares ({activeShares.length})
        </h3>
        {activeShares.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="No active shares"
            description="Share your medical files with healthcare providers"
            actionLabel="View My Files"
            actionHref="/patient/files"
          />
        ) : (
          <div className="space-y-4">
            {activeShares.map((share) => (
              <Card key={share.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <FileImage className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {share.medical_files?.original_filename}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Shared with {share.providers?.profiles?.full_name} •{" "}
                          {share.providers?.practice_name}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary">
                            {share.medical_files?.file_type}
                          </Badge>
                          {share.reviewed_at ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending Review</Badge>
                          )}
                        </div>
                        {share.provider_notes && (
                          <div className="mt-3 rounded-lg bg-muted p-3">
                            <p className="text-sm font-medium">Provider Notes:</p>
                            <p className="text-sm text-muted-foreground">
                              {share.provider_notes}
                            </p>
                          </div>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Shared on{" "}
                          {new Date(share.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/patient/files/${share.medical_files?.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View File
                        </Button>
                      </Link>
                      <RevokeShareButton shareId={share.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Shares */}
      {revokedShares.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold text-muted-foreground">
            Revoked Shares ({revokedShares.length})
          </h3>
          <div className="space-y-4">
            {revokedShares.map((share) => (
              <Card key={share.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <FileImage className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {share.medical_files?.original_filename}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Was shared with {share.providers?.profiles?.full_name}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        <XCircle className="mr-1 h-3 w-3" />
                        Revoked
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
