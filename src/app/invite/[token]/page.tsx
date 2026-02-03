import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Get invitation by token
  const { data: invitation } = await supabase
    .from("invitations")
    .select(`
      id,
      email,
      status,
      message,
      expires_at,
      providers(
        practice_name,
        specialty,
        profiles(full_name)
      )
    `)
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="absolute inset-0 hero-pattern opacity-30" />
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
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
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="absolute inset-0 hero-pattern opacity-30" />
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {invitation.status === "accepted" ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Already Connected</h2>
                <p className="mt-3 text-muted-foreground max-w-xs">
                  You&apos;ve already accepted this invitation.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">
                  Invitation {isExpired ? "Expired" : "Cancelled"}
                </h2>
                <p className="mt-3 text-muted-foreground max-w-xs">
                  This invitation is no longer valid. Please ask your provider
                  to send a new invitation.
                </p>
              </>
            )}
            <Link href="/" className="mt-8">
              <Button className="btn-glow shadow-lg shadow-primary/25">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to signup with invitation context
    redirect(`/signup?invitation=${token}&email=${encodeURIComponent(invitation.email)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invitationData = invitation as any;

  // User is logged in, show acceptance page
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 hero-pattern opacity-30" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8 group animate-fade-in-up">
        <span className="text-3xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
          Custodia<span className="text-primary">Med.</span>
        </span>
      </Link>

      <Card className="relative z-10 w-full max-w-md shadow-soft-lg border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up-delay-1">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Connection Request</span>
          </div>
          <CardTitle className="text-2xl">You&apos;ve Been Invited</CardTitle>
          <CardDescription className="text-base">
            A healthcare provider wants to connect with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex items-center gap-4 rounded-2xl border bg-muted/30 p-5 transition-all hover:bg-muted/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl feature-icon">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {invitationData.providers?.profiles?.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {invitationData.providers?.practice_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {invitationData.providers?.specialty}
              </p>
            </div>
          </div>

          {invitationData.message && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
              <p className="text-sm font-medium text-primary mb-2">Personal Message</p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{invitationData.message}&rdquo;
              </p>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            By accepting, you&apos;ll be able to share your medical imaging
            files with this provider.
          </p>

          <div className="flex gap-4 pt-2">
            <form
              action={`/api/invitations/${invitationData.id}/decline`}
              method="POST"
              className="flex-1"
            >
              <Button type="submit" variant="outline" className="w-full h-12 font-medium border-2">
                Decline
              </Button>
            </form>
            <form
              action={`/api/invitations/${invitationData.id}/accept`}
              method="POST"
              className="flex-1"
            >
              <Button type="submit" className="w-full h-12 font-medium btn-glow shadow-lg shadow-primary/25">
                Accept
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
