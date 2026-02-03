"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Mail, MessageSquare, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InvitePatientPage() {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    async function loadProvider() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: provider } = await supabase
          .from("providers")
          .select("id, practice_name")
          .eq("user_id", user.id)
          .single();

        if (provider) {
          // Generate the invite link using provider ID
          const baseUrl = window.location.origin;
          setInviteLink(`${baseUrl}/signup?provider=${provider.id}`);
          setProviderName(provider.practice_name || "Your Practice");
        }
      }
      setLoading(false);
    }
    loadProvider();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Share your medical imaging with ${providerName}`);
    const body = encodeURIComponent(
      `Hello,\n\n${providerName} has invited you to share your medical imaging files securely.\n\nClick this link to create your account and upload your files:\n${inviteLink}\n\nBest regards,\n${providerName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(
      `${providerName} invites you to share your medical imaging. Create your account here: ${inviteLink}`
    );
    window.open(`sms:?body=${message}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold">Invite Patient</h2>
        <p className="text-muted-foreground mt-1">
          Share your unique link with patients so they can send you their medical imaging
        </p>
      </div>

      {/* Main Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Your Invite Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When patients sign up using this link, they&apos;ll automatically be connected to your practice
            and can share their imaging files with you.
          </p>

          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button
              onClick={copyToClipboard}
              variant={copied ? "default" : "outline"}
              className="shrink-0 gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Share</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Send the link directly to your patient via email or text message
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareViaEmail}
            >
              <Mail className="h-4 w-4" />
              Send via Email
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={shareViaSMS}
            >
              <MessageSquare className="h-4 w-4" />
              Send via Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">1</span>
              <span>Share this link with your patient (email, text, print, etc.)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">2</span>
              <span>Patient creates their account using the link</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
              <span>Patient uploads their medical imaging files</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">4</span>
              <span>You receive and view the shared studies in your dashboard</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
