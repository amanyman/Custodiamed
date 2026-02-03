import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Sign up as a patient to share your medical imaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          <div>
            Are you a healthcare provider?{" "}
            <Link href="/signup/provider" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
