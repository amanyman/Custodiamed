"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Share2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  Shield,
  Link as LinkIcon,
  Mail,
  ZoomIn,
  Ruler,
  Layers,
  Contrast,
  RotateCcw,
  Maximize,
  Grid3X3,
  MousePointer2,
  Move,
} from "lucide-react";

// Logo component
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
                href="#viewer"
                className="text-sm text-muted-foreground link-hover transition-colors hover:text-foreground"
              >
                Image Viewer
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
              Share Medical Imaging{" "}
              <span className="gradient-text">In Seconds</span>
            </h1>

            <p className="animate-fade-in-up-delay-1 mt-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
              Upload your imaging CD, get a secure link, send it to your doctor.
              It&apos;s that simple. No accounts needed for your provider.
            </p>

            <div className="animate-fade-in-up-delay-2 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="btn-glow gap-2 h-14 px-8 text-base font-semibold shadow-xl shadow-primary/30">
                  Start Sharing Free
                  <ArrowRight className="h-5 w-5" />
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
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span>Links Expire in 7 Days</span>
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
                  <p className="font-medium text-sm">Link Copied!</p>
                  <p className="text-xs text-muted-foreground">Ready to share</p>
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
                  <p className="font-medium text-sm">763 files uploaded</p>
                  <p className="text-xs text-muted-foreground">Brain MRI Study</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified 3 Steps */}
      <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-4xl font-bold md:text-5xl">
              3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No complicated setup. No waiting. Just share.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-blue-600">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Upload Your Files</h3>
                <p className="text-muted-foreground">
                  Insert your imaging CD and drag the folder into CustodiaMed. We handle MRIs, CT scans, X-rays, and more.
                </p>
              </div>
              {/* Arrow to next */}
              <div className="hidden md:block absolute top-10 -right-4 w-8 h-8">
                <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <LinkIcon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-purple-600">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Get a Secure Link</h3>
                <p className="text-muted-foreground">
                  Click &quot;Share&quot; to instantly generate a secure link. Copy it with one click.
                </p>
              </div>
              {/* Arrow to next */}
              <div className="hidden md:block absolute top-10 -right-4 w-8 h-8">
                <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl" />
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Mail className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-green-600">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Send to Your Doctor</h3>
                <p className="text-muted-foreground">
                  Email or text the link to your healthcare provider. They click it and view your images instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Demo Card */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl bg-card border shadow-soft-lg overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-background rounded-lg px-4 py-1.5 text-sm text-muted-foreground">
                      custodiamed.com/share
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Your share link is ready!</h4>
                      <p className="text-sm text-muted-foreground">Send this to your healthcare provider</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm truncate">
                      https://custodiamed.com/view/abc123xyz...
                    </div>
                    <Button className="shrink-0">
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Image Viewer Section - For Doctors */}
      <section id="viewer" className="relative py-24 md:py-32 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 mb-6">
              <Sparkles className="h-4 w-4" />
              <span>For Healthcare Providers</span>
            </div>
            <h2 className="text-4xl font-bold md:text-5xl">
              Medical-Grade Image Viewer
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              View DICOM images with professional tools - right in your browser. No software to install.
            </p>
          </div>

          {/* Viewer Mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden">
              {/* Viewer Header */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Logo className="text-lg" />
                  <span className="text-slate-400 text-sm">DICOM Viewer</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Patient: John D.</span>
                  <span className="text-slate-600">|</span>
                  <span>Brain MRI</span>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex">
                {/* Toolbar */}
                <div className="w-16 bg-slate-900/50 border-r border-slate-700 py-4 flex flex-col items-center gap-2">
                  {[
                    { icon: MousePointer2, label: "Select" },
                    { icon: Move, label: "Pan" },
                    { icon: ZoomIn, label: "Zoom" },
                    { icon: Ruler, label: "Measure" },
                    { icon: Contrast, label: "Window" },
                    { icon: RotateCcw, label: "Reset" },
                    { icon: Layers, label: "Layers" },
                    { icon: Grid3X3, label: "Grid" },
                    { icon: Maximize, label: "Fullscreen" },
                  ].map((tool, i) => (
                    <button
                      key={i}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        i === 0 ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                      title={tool.label}
                    >
                      <tool.icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>

                {/* Main Viewer Area */}
                <div className="flex-1 p-4">
                  <div className="relative aspect-square max-h-[400px] mx-auto bg-black rounded-lg overflow-hidden">
                    {/* Simulated MRI Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 400 400" className="w-full h-full opacity-90">
                        <defs>
                          <radialGradient id="brain" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#4a5568" />
                            <stop offset="40%" stopColor="#2d3748" />
                            <stop offset="70%" stopColor="#1a202c" />
                            <stop offset="100%" stopColor="#000" />
                          </radialGradient>
                        </defs>
                        {/* Skull outline */}
                        <ellipse cx="200" cy="200" rx="150" ry="170" fill="url(#brain)" />
                        {/* Brain structure simulation */}
                        <ellipse cx="200" cy="180" rx="120" ry="130" fill="#374151" opacity="0.8" />
                        <path d="M200 80 Q 280 150 280 200 Q 280 280 200 300 Q 120 280 120 200 Q 120 150 200 80" fill="#4b5563" opacity="0.6" />
                        {/* Ventricles */}
                        <ellipse cx="170" cy="180" rx="20" ry="35" fill="#1f2937" />
                        <ellipse cx="230" cy="180" rx="20" ry="35" fill="#1f2937" />
                        {/* Center line */}
                        <line x1="200" y1="80" x2="200" y2="300" stroke="#6b7280" strokeWidth="1" opacity="0.3" />
                      </svg>
                    </div>

                    {/* Overlay info */}
                    <div className="absolute top-3 left-3 text-xs font-mono text-green-400 space-y-1">
                      <div>W: 400 L: 40</div>
                      <div>Slice: 12/24</div>
                    </div>
                    <div className="absolute top-3 right-3 text-xs font-mono text-green-400">
                      <div>256 x 256</div>
                    </div>
                    <div className="absolute bottom-3 left-3 text-xs font-mono text-green-400">
                      <div>MRI Brain</div>
                      <div>T1 Weighted</div>
                    </div>

                    {/* Measurement line demo */}
                    <svg className="absolute inset-0 pointer-events-none">
                      <line x1="120" y1="200" x2="280" y2="200" stroke="#22d3ee" strokeWidth="2" />
                      <circle cx="120" cy="200" r="4" fill="#22d3ee" />
                      <circle cx="280" cy="200" r="4" fill="#22d3ee" />
                      <text x="200" y="190" textAnchor="middle" fill="#22d3ee" fontSize="12" fontFamily="monospace">
                        8.4 cm
                      </text>
                    </svg>
                  </div>

                  {/* Slice thumbnails */}
                  <div className="mt-4 flex justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded bg-slate-800 border-2 ${
                          i === 4 ? "border-blue-500" : "border-transparent"
                        } overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Image Info */}
                <div className="w-64 bg-slate-900/50 border-l border-slate-700 p-4 hidden lg:block">
                  <h4 className="font-semibold text-sm text-slate-300 mb-4">Study Information</h4>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Patient", "John D."],
                      ["Study Date", "Jan 15, 2024"],
                      ["Modality", "MRI"],
                      ["Body Part", "Brain"],
                      ["Series", "T1 Weighted"],
                      ["Images", "24 slices"],
                      ["Facility", "City Medical"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-300">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="font-semibold text-sm text-slate-300 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start gap-2" variant="secondary">
                        <Eye className="h-4 w-4" />
                        Download Study
                      </Button>
                      <Button size="sm" className="w-full justify-start gap-2" variant="secondary">
                        <Share2 className="h-4 w-4" />
                        Share with Colleague
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Viewer Features */}
          <div className="mt-16 grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: ZoomIn, title: "Zoom & Pan", desc: "Navigate through high-resolution images" },
              { icon: Ruler, title: "Measure", desc: "Precise measurements in mm or cm" },
              { icon: Contrast, title: "Window/Level", desc: "Adjust brightness and contrast" },
              { icon: Layers, title: "Multi-planar", desc: "View axial, sagittal, coronal" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
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
                title: "Secure Sharing",
                description: "Links expire automatically after 7 days",
              },
              {
                icon: Lock,
                title: "Encrypted",
                description: "256-bit encryption in transit and at rest",
              },
              {
                icon: Eye,
                title: "Private",
                description: "Only people with your link can view",
              },
              {
                icon: CheckCircle2,
                title: "You Control",
                description: "Delete your files anytime",
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
                Ready to Share?
              </h2>
              <p className="mt-6 text-lg text-white/80">
                Create your free account and share your first study in under 5 minutes.
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
