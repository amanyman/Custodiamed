import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Share2, ArrowRight, Copy, Mail, MessageSquare, Disc3, Monitor } from "lucide-react";
import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to CustodiaMed</h1>
        <p className="text-muted-foreground text-lg">
          Share your medical imaging with your doctor in 3 easy steps
        </p>
      </div>

      {/* Step 1: Get Files from CD */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                1
              </div>
              <h2 className="text-xl font-semibold">Get Your Files from the CD</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Infographic: CD to Computer */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
              {/* CD Icon */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-soft">
                  <Disc3 className="h-12 w-12 text-slate-500" />
                </div>
                <p className="text-sm font-medium">Medical CD</p>
              </div>

              {/* Arrow */}
              <div className="text-primary">
                <ArrowRight className="h-8 w-8 rotate-90 md:rotate-0" />
              </div>

              {/* Computer Icon */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-soft">
                  <Monitor className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-sm font-medium">Your Computer</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold">A</div>
                  Insert the CD
                </div>
                <p className="text-sm text-muted-foreground">
                  Put the CD in your computer. A window may open automatically - you can close it.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold">B</div>
                  Find the folder
                </div>
                <p className="text-sm text-muted-foreground">
                  Open File Explorer and click on the CD. Look for a folder named <span className="font-mono bg-muted px-1 rounded text-foreground">DICOM</span> or <span className="font-mono bg-muted px-1 rounded text-foreground">IMAGES</span>.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-green-800 font-medium flex items-center gap-2">
                <span className="text-xl">💡</span>
                Tip: Copy the folder to your Desktop first - it makes uploading easier!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-lg">
                2
              </div>
              <h2 className="text-xl font-semibold">Upload Your Files</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Infographic: Drag and Drop */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
              {/* Folder */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-soft">
                  <FolderOpen className="h-12 w-12 text-amber-500" />
                </div>
                <p className="text-sm font-medium">Your Folder</p>
              </div>

              {/* Drag Arrow */}
              <div className="text-purple-500 flex flex-col items-center">
                <span className="text-xs font-medium mb-1">DRAG</span>
                <ArrowRight className="h-8 w-8 rotate-90 md:rotate-0" />
              </div>

              {/* Upload Box */}
              <div className="text-center">
                <div className="w-32 h-24 mx-auto mb-2 border-2 border-dashed border-purple-400 rounded-2xl bg-purple-50 flex flex-col items-center justify-center shadow-soft">
                  <Upload className="h-8 w-8 text-purple-500 mb-1" />
                  <span className="text-xs text-purple-600 font-medium">Drop here</span>
                </div>
                <p className="text-sm font-medium">Upload Area</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold">1</div>
                  Drag the folder
                </div>
                <p className="text-sm text-muted-foreground">
                  Click and hold on your folder, then drag it into the upload box on the next page.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold">2</div>
                  Fill in details
                </div>
                <p className="text-sm text-muted-foreground">
                  Add the hospital name and what type of scan it is (MRI, CT, X-ray, etc.)
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Link href="/patient/files/upload">
                <Button size="lg" className="gap-2 btn-glow shadow-lg shadow-primary/25 text-base px-8">
                  <Upload className="h-5 w-5" />
                  Go to Upload Page
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Share */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                3
              </div>
              <h2 className="text-xl font-semibold">Share with Your Doctor</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Infographic: Copy Link and Send */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
              {/* Click Share */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-soft">
                  <Share2 className="h-9 w-9 text-green-500" />
                </div>
                <p className="text-sm font-medium">Click Share</p>
              </div>

              <ArrowRight className="h-6 w-6 text-green-500 rotate-90 md:rotate-0" />

              {/* Copy Link */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-soft">
                  <Copy className="h-9 w-9 text-green-500" />
                </div>
                <p className="text-sm font-medium">Copy Link</p>
              </div>

              <ArrowRight className="h-6 w-6 text-green-500 rotate-90 md:rotate-0" />

              {/* Send Options */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center gap-2 shadow-soft">
                  <Mail className="h-7 w-7 text-green-500" />
                  <MessageSquare className="h-7 w-7 text-green-500" />
                </div>
                <p className="text-sm font-medium">Email or Text</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-5 text-center space-y-2">
              <p className="font-medium">After uploading, go to My Files and click the Share button on your study.</p>
              <p className="text-sm text-muted-foreground">
                Copy the link and send it to your doctor via email or text message.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Link href="/patient/files">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  <FolderOpen className="h-5 w-5" />
                  Go to My Files
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Done message */}
      <div className="text-center py-4 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-2xl">
        <p className="text-lg font-medium text-foreground">
          That&apos;s it! Your doctor will create a free account to view your images.
        </p>
        <p className="text-muted-foreground mt-1">
          The link you share is secure and expires in 7 days.
        </p>
      </div>
    </div>
  );
}
