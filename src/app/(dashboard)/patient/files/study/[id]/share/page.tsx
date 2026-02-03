"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, CheckCircle, Copy, Link as LinkIcon, Share2 } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function ShareStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studyId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [study, setStudy] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) return;
      setPatientId(patient.id);

      const { data: studyData } = await supabase
        .from("imaging_studies")
        .select("*")
        .eq("id", studyId)
        .single();

      setStudy(studyData);
      setIsLoading(false);
    }

    loadData();
  }, [studyId]);

  const createShareLink = async () => {
    if (!patientId) return;

    setIsCreating(true);
    const supabase = createClient();

    try {
      // Create invitation record
      const { data: invitation, error } = await supabase
        .from("provider_invitations")
        .insert({
          patient_id: patientId,
          study_id: studyId,
          provider_email: "shared@link.com", // placeholder
        })
        .select()
        .single();

      if (error) throw error;

      // Generate the share link
      const siteUrl = window.location.origin;
      const link = `${siteUrl}/provider-invite/${invitation.token}`;
      setShareLink(link);

      toast.success("Share link created!");
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/patient/files/study/${studyId}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Share Study</h2>
          {study && (
            <p className="text-muted-foreground">
              {study.study_type || study.modality} - {new Date(study.study_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {shareLink ? (
        // Show the link
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-green-800">Link Created!</h3>
                <p className="text-sm text-green-700">Share this with your healthcare provider</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="h-12 bg-white text-sm font-mono"
              />
              <Button
                onClick={copyLink}
                className="h-12 px-4 shrink-0"
              >
                {linkCopied ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="bg-white/50 rounded-xl p-4 text-sm">
              <p className="font-medium text-green-800 mb-2">Send this link to your provider via:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>Email</li>
                <li>Text message</li>
                <li>Patient portal</li>
              </ul>
            </div>

            <p className="text-xs text-green-600 text-center">
              Link expires in 7 days
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShareLink(null)}
                className="flex-1 h-12"
              >
                Create Another
              </Button>
              <Button
                onClick={() => router.push("/patient/files")}
                className="flex-1 h-12 btn-glow"
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Create link button
        <Card className="border-0 shadow-soft">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
              <Share2 className="h-10 w-10 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-xl">Share with your provider</h3>
              <p className="text-muted-foreground mt-2">
                Create a secure link to share this study with your healthcare provider
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-sm text-left">
              <p className="font-medium mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click the button below to create a share link</li>
                <li>Copy the link and send it to your provider</li>
                <li>They&apos;ll create a free account to view your study</li>
              </ol>
            </div>

            <Button
              onClick={createShareLink}
              disabled={isCreating}
              size="lg"
              className="w-full h-14 text-lg font-medium btn-glow shadow-lg shadow-primary/25"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-5 w-5" />
                  Create Share Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
