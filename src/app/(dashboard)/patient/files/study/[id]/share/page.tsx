"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Share2, User, Loader2, CheckCircle, Building2, Mail, Send, Copy, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

interface Provider {
  id: string;
  practice_name: string;
  specialty: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ShareStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studyId } = use(params);
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [study, setStudy] = useState<any>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Invite new provider form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
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

      const { data: relationships } = await supabase
        .from("patient_provider_relationships")
        .select(`
          provider_id,
          providers (
            id,
            practice_name,
            specialty,
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq("patient_id", patient.id)
        .eq("status", "active");

      if (relationships) {
        const providerList = relationships
          .map((r: any) => r.providers)
          .filter(Boolean);
        setProviders(providerList);
      }

      setIsLoading(false);
    }

    loadData();
  }, [studyId]);

  const handleShareWithExisting = async () => {
    if (!selectedProvider || !study) return;

    setIsSharing(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) throw new Error("Patient not found");

      const { data: files } = await supabase
        .from("medical_files")
        .select("id")
        .eq("study_id", studyId);

      if (!files || files.length === 0) {
        throw new Error("No files found in this study");
      }

      const shares = files.map((file) => ({
        file_id: file.id,
        patient_id: patient.id,
        provider_id: selectedProvider,
        status: "active",
      }));

      const { error } = await supabase.from("file_shares").insert(shares);

      if (error) throw error;

      toast.success(`Study shared with ${files.length} files!`);
      router.push("/patient/files");
      router.refresh();
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share study. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleInviteProvider = async () => {
    if (!inviteEmail || !patientId) return;

    setIsSendingInvite(true);
    const supabase = createClient();

    try {
      // Create invitation record
      const { data: invitation, error } = await supabase
        .from("provider_invitations")
        .insert({
          patient_id: patientId,
          study_id: studyId,
          provider_email: inviteEmail,
          provider_name: inviteName || null,
          message: inviteMessage || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Get patient profile for the email
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      // Send invitation email
      const response = await fetch("/api/invitations/send-provider-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invitation.token,
          providerEmail: inviteEmail,
          providerName: inviteName,
          patientName: profile?.full_name || "A patient",
          studyType: study?.study_type || study?.modality,
          studyDate: study?.study_date,
          message: inviteMessage,
        }),
      });

      const result = await response.json();

      // Generate the invite link
      const siteUrl = window.location.origin;
      const link = `${siteUrl}/provider-invite/${invitation.token}`;
      setInviteLink(link);

      if (result.success) {
        toast.success("Invitation email sent successfully!");
      } else {
        toast.success("Invitation created! Share the link with your provider.");
      }
    } catch (error) {
      console.error("Invite error:", error);
      toast.error("Failed to create invitation. Please try again.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
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
    <div className="space-y-6 max-w-2xl mx-auto">
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

      <Tabs defaultValue={providers.length > 0 ? "existing" : "invite"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="gap-2">
            <Building2 className="h-4 w-4" />
            My Providers
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-2">
            <Mail className="h-4 w-4" />
            Invite New
          </TabsTrigger>
        </TabsList>

        {/* Share with existing provider */}
        <TabsContent value="existing">
          {providers.length === 0 ? (
            <Card className="border-0 shadow-soft">
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No connected providers</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  You don&apos;t have any connected providers yet. Use the &quot;Invite New&quot; tab to invite a provider by email.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Select Provider</CardTitle>
                  <CardDescription>
                    Choose which healthcare provider should receive this study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedProvider === provider.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{provider.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.practice_name} • {provider.specialty}
                        </p>
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button
                onClick={handleShareWithExisting}
                disabled={!selectedProvider || isSharing}
                size="lg"
                className="w-full h-14 text-lg font-medium btn-glow shadow-lg shadow-primary/25"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-5 w-5" />
                    Share Study
                  </>
                )}
              </Button>
            </>
          )}
        </TabsContent>

        {/* Invite new provider */}
        <TabsContent value="invite">
          {inviteLink ? (
            // Show the generated link
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-green-800">Invitation Created!</h3>
                    <p className="text-sm text-green-700">Share this link with your provider</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="h-12 bg-white text-sm"
                  />
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    className="h-12 px-4 shrink-0"
                  >
                    {linkCopied ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div className="bg-white/50 rounded-xl p-4 text-sm">
                  <p className="font-medium text-green-800 mb-2">How to share:</p>
                  <ol className="list-decimal list-inside space-y-1 text-green-700">
                    <li>Copy the link above</li>
                    <li>Send it to your provider via email, text, or any messaging app</li>
                    <li>They&apos;ll create an account and view your study</li>
                  </ol>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInviteLink(null);
                      setInviteEmail("");
                      setInviteName("");
                      setInviteMessage("");
                    }}
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
            // Show the form
            <>
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Invite a Healthcare Provider</CardTitle>
                  <CardDescription>
                    Create a secure link to share this study with your doctor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerEmail">Provider&apos;s Email *</Label>
                    <Input
                      id="providerEmail"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="providerName">Provider&apos;s Name (optional)</Label>
                    <Input
                      id="providerName"
                      placeholder="Dr. Smith"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Hi Dr. Smith, I'm sharing my recent MRI scan for your review..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>You&apos;ll get a secure link to share with your provider</li>
                      <li>They&apos;ll create a free CustodiaMed account (if needed)</li>
                      <li>Once registered, they can immediately view your study</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleInviteProvider}
                disabled={!inviteEmail || isSendingInvite}
                size="lg"
                className="w-full h-14 text-lg font-medium btn-glow shadow-lg shadow-primary/25"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Invitation...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Create Invitation Link
                  </>
                )}
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
