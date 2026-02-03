import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

interface SignupPageProps {
  searchParams: Promise<{ provider?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const providerId = params.provider;
  let providerName: string | null = null;

  // If there's a provider ID, fetch the provider name
  if (providerId) {
    const supabase = await createClient();
    const { data: provider } = await supabase
      .from("providers")
      .select("practice_name")
      .eq("id", providerId)
      .single();

    if (provider) {
      providerName = provider.practice_name;
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          {providerName ? (
            <>Share your medical imaging with <span className="font-medium text-foreground">{providerName}</span></>
          ) : (
            "Sign up as a patient to share your medical imaging"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm providerId={providerId} providerName={providerName} />
        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          {!providerId && (
            <div>
              Are you a healthcare provider?{" "}
              <Link href="/signup/provider" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
