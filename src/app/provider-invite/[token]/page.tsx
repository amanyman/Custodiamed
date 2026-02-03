import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, FileImage, Calendar, Clock, XCircle, CheckCircle, Sparkles } from "lucide-react";

export default async function ProviderInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Get invitation by token
  const { data: invitation } = await supabase
    .from("provider_invitations")
    .select(`
      id,
      provider_email,
      provider_name,
      message,
      status,
      expires_at,
      study_id,
      imaging_studies (
        id,
        modality,
        study_type,
        study_date,
        file_count,
        facility_name
      ),
      patients (
        id,
        profiles (
          full_name
        )
      )
    `)
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Invalid Invitation</h2>
            <p className="mt-3 text-muted-foreground max-w-xs">
              This invitation link is invalid or has been removed.
            </p>
            <Link href="/" className="mt-8">
              <Button className="btn-glow shadow-lg shadow-primary/25">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();

  if (invitation.status !== "pending" || isExpired) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {invitation.status === "accepted" ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Already Accepted</h2>
                <p className="mt-3 text-muted-foreground max-w-xs">
                  You&apos;ve already accepted this invitation.
                </p>
                <Link href="/login" className="mt-8">
                  <Button className="btn-glow shadow-lg shadow-primary/25">Sign In</Button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Invitation Expired</h2>
                <p className="mt-3 text-muted-foreground max-w-xs">
                  This invitation has expired. Please ask the patient to send a new one.
                </p>
                <Link href="/" className="mt-8">
                  <Button className="btn-glow shadow-lg shadow-primary/25">Go to Home</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invitationData = invitation as any;
  const study = invitationData.imaging_studies;
  const patient = invitationData.patients;

  // Check if provider is already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user is a provider
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "provider") {
      // Accept invitation and redirect to view study
      redirect(`/provider/shared/${invitation.study_id}?invitation=${token}`);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 hero-pattern opacity-30" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8 group">
        <span className="text-3xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
          Custodia<span className="text-primary">Med.</span>
        </span>
      </Link>

      <Card className="relative z-10 w-full max-w-lg shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Medical Records Shared</span>
          </div>
          <CardTitle className="text-2xl">You&apos;ve Been Invited</CardTitle>
          <CardDescription className="text-base">
            A patient wants to share their medical imaging with you
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Patient Info */}
          <div className="flex items-center gap-4 rounded-2xl border bg-muted/30 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {patient?.profiles?.full_name || "A patient"}
              </p>
              <p className="text-sm text-muted-foreground">
                wants to share medical imaging with you
              </p>
            </div>
          </div>

          {/* Study Info */}
          {study && (
            <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-primary" />
                <span className="font-medium">{study.study_type || study.modality}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Study Date: {new Date(study.study_date).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {study.file_count} files available to view
              </div>
              {study.facility_name && (
                <div className="text-sm text-muted-foreground">
                  From: {study.facility_name}
                </div>
              )}
            </div>
          )}

          {/* Personal Message */}
          {invitation.message && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
              <p className="text-sm font-medium text-primary mb-2">Personal Message</p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{invitation.message}&rdquo;
              </p>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Create a free provider account to securely view and download these medical records.
          </p>

          <div className="space-y-3 pt-2">
            <Link href={`/signup/provider?invitation=${token}&email=${encodeURIComponent(invitation.provider_email)}`} className="block">
              <Button className="w-full h-12 font-medium btn-glow shadow-lg shadow-primary/25">
                Create Provider Account
              </Button>
            </Link>
            <Link href={`/login?invitation=${token}&redirect=/provider/shared/${invitation.study_id}`} className="block">
              <Button variant="outline" className="w-full h-12 font-medium border-2">
                I Already Have an Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="relative z-10 mt-8 text-sm text-muted-foreground">
        Secure medical imaging sharing platform
      </p>
    </div>
  );
}
