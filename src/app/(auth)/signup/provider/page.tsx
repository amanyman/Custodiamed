import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderSignupForm } from "@/components/auth/provider-signup-form";

export default function ProviderSignupPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Provider Registration</CardTitle>
        <CardDescription>
          Create your healthcare provider account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProviderSignupForm />
        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          <div>
            Are you a patient?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
