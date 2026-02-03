import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, User, Eye, Clock } from "lucide-react";

export default async function ReceivedFilesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!provider) {
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
        modality,
        study_date
      ),
      patients(
        id,
        profiles(full_name, email)
      )
    `)
    .eq("provider_id", provider.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharesData = (shares || []) as any[];
  const pendingShares = sharesData.filter((s) => !s.reviewed_at);
  const reviewedShares = sharesData.filter((s) => s.reviewed_at);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Received Files</h2>
        <p className="text-muted-foreground">
          Medical imaging files shared with you by patients
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingShares.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <Eye className="h-4 w-4" />
            Reviewed ({reviewedShares.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingShares.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No pending files</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  All shared files have been reviewed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingShares.map((share) => (
                <FileShareCard key={share.id} share={share} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-6">
          {reviewedShares.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No reviewed files</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Files you&apos;ve reviewed will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewedShares.map((share) => (
                <FileShareCard key={share.id} share={share} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FileShareCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  share: any;
}

function FileShareCard({ share }: FileShareCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">
                {share.medical_files?.original_filename}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{share.patients?.profiles?.full_name}</span>
                <span>•</span>
                <span>
                  Shared {new Date(share.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">
                  {share.medical_files?.file_type}
                </Badge>
                {share.medical_files?.modality && (
                  <Badge variant="outline">{share.medical_files.modality}</Badge>
                )}
                {share.medical_files?.study_date && (
                  <Badge variant="outline">
                    Study: {new Date(share.medical_files.study_date).toLocaleDateString()}
                  </Badge>
                )}
                {share.reviewed_at ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Reviewed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
              {share.provider_notes && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Your Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {share.provider_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          <Link href={`/provider/received/${share.id}`}>
            <Button>View File</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
