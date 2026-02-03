"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Share2,
  FileSearch,
  Lock,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  Clock,
  Monitor,
  Stethoscope,
  MessageCircle,
  ArrowDown,
  Shield,
} from "lucide-react";

// Logo component with Mediatio-style branding
function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold ${className}`}>
      Custodia<span className="text-primary">Med.</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] blob blob-1 animate-float" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] blob blob-2 animate-float-delayed" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] blob blob-3 animate-float" />
        <div className="absolute inset-0 hero-pattern opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <Logo className="text-2xl transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="#how-it-works"
                className="text-sm text-muted-foreground link-hover transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-sm text-muted-foreground link-hover transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#security"
                className="text-sm text-muted-foreground link-hover transition-colors hover:text-foreground"
              >
                Security
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="btn-glow font-medium shadow-lg shadow-primary/25">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="animate-fade-in-up text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-[1.1]">
              Your Medical Imaging,{" "}
              <span className="gradient-text">Securely Shared</span>
            </h1>

            <p className="animate-fade-in-up-delay-1 mt-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
              No more carrying CDs to appointments. Share your medical imaging files
              with your healthcare providers in seconds. It&apos;s that simple.
            </p>

            <div className="animate-fade-in-up-delay-2 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="btn-glow gap-2 h-14 px-8 text-base font-semibold shadow-xl shadow-primary/30">
                  Start Sharing Securely
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/signup/provider">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-semibold border-2 hover:bg-secondary">
                  I&apos;m a Healthcare Provider
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in-up-delay-3 mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span>Full Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Floating cards decoration */}
          <div className="absolute -right-20 top-40 hidden xl:block animate-float">
            <div className="rounded-2xl bg-card p-4 shadow-soft-lg border rotate-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">File Shared</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-16 bottom-20 hidden xl:block animate-float-delayed">
            <div className="rounded-2xl bg-card p-4 shadow-soft-lg border -rotate-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Upload Complete</p>
                  <p className="text-xs text-muted-foreground">MRI_Scan.dcm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Story */}
      <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-4xl font-bold md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Share your medical records in three simple steps
            </p>
          </div>

          {/* Visual Timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary to-primary/50 hidden lg:block" />

            {/* Step 1 */}
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-24">
              <div className="lg:text-right order-2 lg:order-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3 lg:justify-end">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-white shadow-lg shadow-primary/30">
                    1
                  </span>
                  <span className="text-lg">Upload</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Drag & Drop Your Files</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Got a CD from your doctor? Simply insert it, find your DICOM files,
                  and drag them into CustodiaMed. We accept images too.
                </p>
              </div>
              <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl blur-xl" />
                  <div className="relative interactive-card rounded-2xl bg-card border p-8 shadow-soft-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Your Computer</p>
                        <p className="text-sm text-muted-foreground">Patient View</p>
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                      <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Drop files here</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>MRI_Brain_Scan.dcm uploaded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center mb-8 lg:hidden">
              <ArrowDown className="h-6 w-6 text-primary animate-bounce" />
            </div>

            {/* Step 2 */}
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-24">
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
                  <div className="relative interactive-card rounded-2xl bg-card border p-8 shadow-soft-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Select Provider</p>
                        <p className="text-sm text-muted-foreground">One click sharing</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                          DR
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Dr. Rebecca Smith</p>
                          <p className="text-xs text-muted-foreground">Neurologist</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <Button className="w-full" size="sm">
                        Share Files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-white shadow-lg shadow-primary/30">
                    2
                  </span>
                  <span className="text-lg">Share</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Select Your Provider</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose which doctor should receive your files. They&apos;ll get instant
                  access - no emails, no USB drives, no waiting.
                </p>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center mb-8 lg:hidden">
              <ArrowDown className="h-6 w-6 text-primary animate-bounce" />
            </div>

            {/* Step 3 */}
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="lg:text-right order-2 lg:order-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3 lg:justify-end">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-white shadow-lg shadow-primary/30">
                    3
                  </span>
                  <span className="text-lg">Done</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Doctor Reviews Instantly</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your provider sees the files immediately on their dashboard.
                  No more &ldquo;we didn&apos;t receive it&rdquo; or &ldquo;the CD wouldn&apos;t read.&rdquo;
                </p>
              </div>
              <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl" />
                  <div className="relative interactive-card rounded-2xl bg-card border p-8 shadow-soft-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Provider Dashboard</p>
                        <p className="text-sm text-muted-foreground">Doctor&apos;s View</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                        <FileSearch className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">New file received!</p>
                          <p className="text-xs text-muted-foreground">From: John Smith</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <p className="text-sm italic text-muted-foreground">
                          &ldquo;Thank you for sharing your records!&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real World Example */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Real World Example</span>
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">
                See How Easy It Is
              </h2>
            </div>

            {/* Story Cards */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-green-500 rounded-full" />

              {/* Story Point 1 */}
              <div className="relative pl-20 pb-12">
                <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg" />
                <div className="card-hover rounded-2xl bg-card border p-6 shadow-soft">
                  <p className="text-sm text-muted-foreground mb-2">The Problem</p>
                  <p className="text-lg">
                    Sarah just got an MRI at the imaging center. They hand her a CD and say,
                    &ldquo;Give this to your neurologist.&rdquo;
                  </p>
                </div>
              </div>

              {/* Story Point 2 */}
              <div className="relative pl-20 pb-12">
                <div className="absolute left-6 w-5 h-5 rounded-full bg-purple-500 border-4 border-background shadow-lg" />
                <div className="card-hover rounded-2xl bg-card border p-6 shadow-soft">
                  <p className="text-sm text-muted-foreground mb-2">The Old Way</p>
                  <p className="text-lg">
                    She doesn&apos;t have a CD drive. She tries to find one, eventually mails
                    the CD, it gets lost, she has to request another copy... 2 weeks later.
                  </p>
                </div>
              </div>

              {/* Story Point 3 */}
              <div className="relative pl-20 pb-12">
                <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg" />
                <div className="card-hover rounded-2xl bg-card border p-6 shadow-soft bg-primary/5">
                  <p className="text-sm text-primary font-medium mb-2">With CustodiaMed</p>
                  <p className="text-lg">
                    Sarah borrows a USB CD drive, drags the files into CustodiaMed,
                    clicks &ldquo;Share with Dr. Johnson&rdquo; — done in 2 minutes.
                  </p>
                </div>
              </div>

              {/* Story Point 4 */}
              <div className="relative pl-20">
                <div className="absolute left-6 w-5 h-5 rounded-full bg-green-500 border-4 border-background shadow-lg" />
                <div className="card-hover rounded-2xl bg-card border p-6 shadow-soft bg-green-50">
                  <p className="text-sm text-green-600 font-medium mb-2">The Result</p>
                  <p className="text-lg">
                    Dr. Johnson reviews the MRI that same afternoon and calls Sarah
                    to discuss the results. No delays, no lost CDs, no frustration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold md:text-5xl">
              Built for Everyone
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you&apos;re a patient or healthcare provider, CustodiaMed
              makes medical imaging simple
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* For Patients */}
            <div className="interactive-card rounded-3xl border bg-card p-10 shadow-soft">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl feature-icon">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-6">For Patients</h3>
              <ul className="space-y-5">
                {[
                  "Upload imaging files from CDs in seconds",
                  "Control exactly who can see your files",
                  "Revoke access anytime with one click",
                  "Track who has viewed your imaging",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Providers */}
            <div className="interactive-card rounded-3xl border bg-card p-10 shadow-soft">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl feature-icon">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-6">For Healthcare Providers</h3>
              <ul className="space-y-5">
                {[
                  "Receive imaging files directly from patients",
                  "Invite patients to share their records",
                  "Add notes and mark files as reviewed",
                  "HIPAA-compliant audit trail included",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold md:text-5xl">
              Security You Can Trust
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your medical data deserves the highest level of protection
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              {
                icon: Shield,
                title: "HIPAA Compliant",
                description: "Built with HIPAA requirements in mind",
              },
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "Files encrypted in transit and at rest",
              },
              {
                icon: FileSearch,
                title: "Audit Logging",
                description: "Complete record of all access",
              },
              {
                icon: Clock,
                title: "Access Control",
                description: "You decide who sees your data",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-hover rounded-2xl border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl feature-icon">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-12 md:p-20 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold text-white md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mt-6 text-lg text-white/80">
                Join thousands of patients and providers who trust CustodiaMed for
                secure medical imaging sharing.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-xl gap-2"
                  >
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup/provider">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base font-semibold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Provider Registration
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Logo className="text-2xl" />
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="link-hover hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="link-hover hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="#" className="link-hover hover:text-foreground">
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CustodiaMed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
