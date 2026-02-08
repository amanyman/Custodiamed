import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUser, getProvider } from "@/lib/supabase/cached";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Link2, FileText, Eye, Upload, User, Monitor, Search } from "lucide-react";
import Link from "next/link";

export default async function ProviderDashboard() {
  const user = await getUser();
  if (!user) redirect("/login");

  const provider = await getProvider(user.id);
  if (!provider) redirect("/login");

  // Get counts for quick stats
  const supabase = await createClient();
  const [{ count: pendingCount }, { count: ownFilesCount }] = await Promise.all([
    supabase
      .from("file_shares")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", provider.id)
      .eq("status", "active")
      .is("reviewed_at", null),
    supabase
      .from("imaging_studies")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", provider.id),
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, {provider?.practice_name}</h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s how to receive and view medical imaging from your patients
        </p>
      </div>

      {/* Quick Stats Banner */}
      {pendingCount && pendingCount > 0 ? (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">You have {pendingCount} studies awaiting review</p>
                <p className="text-sm text-muted-foreground">Click to view and analyze them</p>
              </div>
            </div>
            <Link href="/provider/studies">
              <Button size="sm" className="gap-2">
                View Studies
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Own Files Card */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Upload className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              {ownFilesCount && ownFilesCount > 0 ? (
                <>
                  <p className="font-medium">You have {ownFilesCount} uploaded {ownFilesCount === 1 ? 'study' : 'studies'}</p>
                  <p className="text-sm text-muted-foreground">View and manage your uploaded files</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Upload your own files</p>
                  <p className="text-sm text-muted-foreground">Upload medical imaging files to your personal library</p>
                </>
              )}
            </div>
          </div>
          <Link href={ownFilesCount && ownFilesCount > 0 ? "/provider/files" : "/provider/files/upload"}>
            <Button size="sm" variant="outline" className="gap-2">
              {ownFilesCount && ownFilesCount > 0 ? "View Files" : "Upload Files"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Getting Started Steps */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">How It Works</h3>

        <div className="grid gap-6">
          {/* Step 1: Send Invite Link */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="bg-blue-500/10 p-8 flex items-center justify-center md:w-48">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-soft">
                      <Link2 className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">1</span>
                    <h4 className="text-lg font-semibold">Send Your Invite Link to Patient</h4>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Get your unique invite link and send it to patients via email, text, or however you prefer.
                    They&apos;ll use this link to create an account and share their imaging with you.
                  </p>
                  <Link href="/provider/invite">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Link2 className="h-4 w-4" />
                      Get Your Invite Link
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Patient Uploads & Shares */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="bg-purple-500/10 p-8 flex items-center justify-center md:w-48">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-soft">
                      <Upload className="h-10 w-10 text-purple-500" />
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white text-sm font-bold">2</span>
                    <h4 className="text-lg font-semibold">Patient Uploads Their Imaging</h4>
                  </div>
                  <p className="text-muted-foreground">
                    The patient creates an account using your link, uploads their medical imaging files from their CD or computer,
                    and shares the study directly with you. You&apos;ll be notified when new files are available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: View & Analyze */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="bg-green-500/10 p-8 flex items-center justify-center md:w-48">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-soft">
                      <Monitor className="h-10 w-10 text-green-500" />
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                        <Search className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold">3</span>
                    <h4 className="text-lg font-semibold">View & Analyze with Professional Tools</h4>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Open shared studies in our medical-grade viewer. Zoom, pan, adjust window/level,
                    take measurements, add annotations, and more - all the tools you need for proper analysis.
                  </p>
                  <Link href="/provider/studies">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View Shared Studies
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Highlights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Viewer Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Zoom & Pan
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Window/Level Presets
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Distance & Angle
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Area Measurement
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Annotations
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Multi-image Layout
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              DICOM Metadata
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Series Comparison
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
