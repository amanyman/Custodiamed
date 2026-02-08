import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
      </div>
      <Card className="relative z-10 w-full max-w-md border-0 shadow-soft-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="mt-3 text-muted-foreground max-w-xs">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className="mt-8">
            <Button className="btn-glow shadow-lg shadow-primary/25">
              Go to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
