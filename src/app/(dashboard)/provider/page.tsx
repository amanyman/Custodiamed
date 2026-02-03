import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Link2, FileText, Eye } from "lucide-react";
import Link from "next/link";

export default async function ProviderDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get provider record
  const { data: provider } = await supabase
    .from("providers")
    .select("id, practice_name")
    .eq("user_id", user!.id)
    .single();

  // Get counts for quick stats
  const { count: pendingCount } = await supabase
    .from("file_shares")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider?.id || "")
    .eq("status", "active")
    .is("reviewed_at", null);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold">Welcome, {provider?.practice_name}</h2>
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
                    {/* Link icon with share visual */}
                    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Chain link */}
                      <rect x="20" y="30" width="35" height="40" rx="8" stroke="#3b82f6" strokeWidth="3" fill="none"/>
                      <rect x="65" y="30" width="35" height="40" rx="8" stroke="#3b82f6" strokeWidth="3" fill="none"/>
                      {/* Connecting link */}
                      <path d="M55 50 L65 50" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                      {/* Share arrows */}
                      <path d="M100 25 L110 35 L100 45" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 55 L0 65 L10 75" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                    {/* Patient uploading visual */}
                    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Person icon */}
                      <circle cx="40" cy="25" r="12" stroke="#a855f7" strokeWidth="2.5" fill="none"/>
                      <path d="M20 65 Q20 45 40 45 Q60 45 60 65" stroke="#a855f7" strokeWidth="2.5" fill="none"/>
                      {/* Arrow to cloud */}
                      <path d="M65 50 L85 50" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M78 43 L85 50 L78 57" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Cloud/upload box */}
                      <rect x="90" y="35" width="25" height="30" rx="4" stroke="#a855f7" strokeWidth="2.5" fill="none"/>
                      <path d="M102 55 L102 45 M97 50 L102 45 L107 50" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                    {/* Viewer/analysis visual */}
                    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Monitor */}
                      <rect x="15" y="15" width="90" height="55" rx="4" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
                      {/* Screen content - grid */}
                      <line x1="60" y1="20" x2="60" y2="65" stroke="#4ade80" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="20" y1="42" x2="100" y2="42" stroke="#4ade80" strokeWidth="1.5" opacity="0.5"/>
                      {/* Medical cross */}
                      <rect x="50" y="32" width="20" height="20" rx="2" fill="none" stroke="#22c55e" strokeWidth="2"/>
                      <path d="M55 42 L65 42 M60 37 L60 47" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                      {/* Monitor stand */}
                      <path d="M60 70 L60 80 M45 80 L75 80" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
                      {/* Magnifier */}
                      <circle cx="95" cy="75" r="10" stroke="#4ade80" strokeWidth="2" fill="none"/>
                      <path d="M102 82 L110 90" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
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
