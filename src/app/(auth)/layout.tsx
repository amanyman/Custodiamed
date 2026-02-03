import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute inset-0 hero-pattern opacity-30" />
      </div>

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 mb-8 group animate-fade-in-up"
      >
        <span className="text-3xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
          Custodia<span className="text-primary">Med.</span>
        </span>
      </Link>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up-delay-1">
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-sm text-muted-foreground animate-fade-in-up-delay-2">
        Secure medical imaging sharing platform
      </p>
    </div>
  );
}
