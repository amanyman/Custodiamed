"use client";

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Logo with pulse animation */}
      <div className="relative">
        <div className="text-3xl font-bold mb-4">
          Custodia<span className="text-primary">Med.</span>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            {/* Spinning arc */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mt-6">Loading...</p>
    </div>
  );
}
