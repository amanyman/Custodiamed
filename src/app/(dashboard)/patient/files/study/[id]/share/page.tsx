"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Share2, User, Loader2, CheckCircle, Building2 } from "lucide-react";
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

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get patient ID
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) return;

      // Get study info
      const { data: studyData } = await supabase
        .from("imaging_studies")
        .select("*")
        .eq("id", studyId)
        .single();

      setStudy(studyData);

      // Get connected providers
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

  const handleShare = async () => {
    if (!selectedProvider || !study) return;

    setIsSharing(true);
    const supabase = createClient();

    try {
      // Get current user and patient
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) throw new Error("Patient not found");

      // Get all files in the study
      const { data: files } = await supabase
        .from("medical_files")
        .select("id")
        .eq("study_id", studyId);

      if (!files || files.length === 0) {
        throw new Error("No files found in this study");
      }

      // Create file shares for each file
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

      {providers.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No connected providers</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              You need to be connected with a healthcare provider before you can share files.
              Ask your provider to send you an invitation.
            </p>
            <Link href="/patient/providers" className="mt-4 inline-block">
              <Button variant="outline">View My Providers</Button>
            </Link>
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
            onClick={handleShare}
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
    </div>
  );
}
