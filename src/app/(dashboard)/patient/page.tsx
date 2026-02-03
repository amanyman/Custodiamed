import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload, Users, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PatientDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  // Run all queries in parallel for faster loading
  const [filesResult, providersResult, sharesResult, recentFilesResult] = await Promise.all([
    supabase
      .from("medical_files")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patient?.id || ""),
    supabase
      .from("patient_provider_relationships")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patient?.id || "")
      .eq("status", "active"),
    supabase
      .from("file_shares")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patient?.id || "")
      .eq("status", "active"),
    supabase
      .from("imaging_studies")
      .select("*")
      .eq("patient_id", patient?.id || "")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const filesCount = filesResult.count;
  const providersCount = providersResult.count;
  const sharesCount = sharesResult.count;
  const recentStudies = recentFilesResult.data;

  const stats = [
    {
      title: "Total Files",
      value: filesCount || 0,
      icon: FolderOpen,
      href: "/patient/files",
    },
    {
      title: "Connected Providers",
      value: providersCount || 0,
      icon: Users,
      href: "/patient/providers",
    },
    {
      title: "Active Shares",
      value: sharesCount || 0,
      icon: Share2,
      href: "/patient/shares",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your medical imaging
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload medical imaging files from CDs or your device
              </p>
              <Link href="/patient/files/upload">
                <Button className="gap-2">
                  Upload Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Share with Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Share your medical imaging with healthcare providers
              </p>
              <Link href="/patient/files">
                <Button variant="outline" className="gap-2">
                  View Files
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Studies */}
      <RecentStudies studies={recentStudies} />
    </div>
  );
}

function RecentStudies({ studies }: { studies: any[] | null }) {
  if (!studies || studies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Studies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No studies uploaded yet.{" "}
            <Link href="/patient/files/upload" className="text-primary hover:underline">
              Upload your first study
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Studies</CardTitle>
        <Link href="/patient/files">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studies.map((study) => (
            <div
              key={study.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{study.study_type || study.modality}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(study.study_date).toLocaleDateString()}
                    {study.facility_name && ` • ${study.facility_name}`}
                  </p>
                </div>
              </div>
              <Link href={`/patient/files/study/${study.id}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
