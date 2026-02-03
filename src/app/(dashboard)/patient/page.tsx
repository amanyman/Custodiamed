import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Share2, Disc, Monitor, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to CustodiaMed</h1>
        <p className="text-muted-foreground text-lg">
          Share your medical imaging with healthcare providers in 3 simple steps
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-6">
        {/* Step 1: Get Files from CD */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 md:p-8 md:w-16 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  1
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Disc className="h-5 w-5 text-primary" />
                  Get Your Files from the CD
                </h2>
                <p className="text-muted-foreground mb-4">
                  When you insert a medical imaging CD, the files are usually accessed in one of these ways:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                    <Monitor className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Option A: CD opens automatically</p>
                      <p className="text-sm text-muted-foreground">
                        A viewer program may launch. Look for an &quot;Export&quot; or &quot;Save&quot; option,
                        or close it and browse the CD directly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                    <FolderOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Option B: Browse the CD folder</p>
                      <p className="text-sm text-muted-foreground">
                        Open File Explorer (Windows) or Finder (Mac). Click on the CD drive.
                        Look for a folder called <span className="font-mono bg-muted px-1 rounded">DICOM</span>, <span className="font-mono bg-muted px-1 rounded">IMAGES</span>, or <span className="font-mono bg-muted px-1 rounded">DATA</span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Tip: Copy the entire folder to your desktop first</p>
                      <p className="text-sm text-muted-foreground">
                        Right-click the main folder on the CD and select &quot;Copy&quot;.
                        Then paste it on your Desktop. This makes uploading faster and easier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Upload */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 md:p-8 md:w-16 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  2
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Your Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  Go to the Upload page and drag the entire folder (or select all files) into the upload area.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Drag & drop</span> - Simply drag the folder from your desktop into the upload box
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Or click to browse</span> - Click the upload area, navigate to your folder, select all files (Ctrl+A), and click Open
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Fill in the details</span> - Add the facility name and study type, then click Upload
                    </p>
                  </div>
                </div>
                <Link href="/patient/files/upload">
                  <Button className="gap-2 btn-glow shadow-lg shadow-primary/25">
                    <Upload className="h-4 w-4" />
                    Go to Upload
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Share */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 md:p-8 md:w-16 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  3
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share with Your Provider
                </h2>
                <p className="text-muted-foreground mb-4">
                  Once uploaded, go to My Files, find your study, and click &quot;Share&quot; to get a link.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Click Share</span> - On your uploaded study, click the Share button
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Copy the link</span> - Click &quot;Create Share Link&quot; and copy it
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Send to your provider</span> - Email, text, or message the link to your healthcare provider
                    </p>
                  </div>
                </div>
                <Link href="/patient/files">
                  <Button variant="outline" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Go to My Files
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* That's it! */}
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          That&apos;s it! Your provider will create a free account to securely view your imaging.
        </p>
      </div>
    </div>
  );
}
