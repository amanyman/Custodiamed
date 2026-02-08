"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AiAnalysisPanelProps {
  imageUrl: string;
  onClose: () => void;
}

export function AiAnalysisPanel({ imageUrl, onClose }: AiAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown-like rendering for the analysis text
  const renderAnalysis = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold headers like **Header**
      if (line.match(/^\*\*.*\*\*:?$/)) {
        const content = line.replace(/\*\*/g, "").replace(/:$/, "");
        return (
          <h4
            key={i}
            className="text-sm font-semibold text-white/90 mt-4 mb-1.5 first:mt-0"
          >
            {content}
          </h4>
        );
      }
      // Numbered headers like 1. **Header**: content
      const numberedMatch = line.match(
        /^\d+\.\s*\*\*(.*?)\*\*:?\s*(.*)?$/
      );
      if (numberedMatch) {
        return (
          <div key={i} className="mt-3 first:mt-0">
            <h4 className="text-sm font-semibold text-blue-400/90 mb-1">
              {numberedMatch[1]}
            </h4>
            {numberedMatch[2] && (
              <p className="text-xs text-zinc-300/80 leading-relaxed">
                {numberedMatch[2]}
              </p>
            )}
          </div>
        );
      }
      // Bullet points
      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s/, "");
        return (
          <div key={i} className="flex gap-2 ml-1 mt-1">
            <span className="text-blue-400/60 mt-0.5 text-xs shrink-0">
              -
            </span>
            <p className="text-xs text-zinc-300/80 leading-relaxed">
              {renderBold(content)}
            </p>
          </div>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      // Regular text
      return (
        <p key={i} className="text-xs text-zinc-300/80 leading-relaxed">
          {renderBold(line)}
        </p>
      );
    });
  };

  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-medium text-white/90">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-[340px] bg-[#0d0d12]/95 backdrop-blur-xl border-l border-white/[0.06] flex flex-col shrink-0 animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-violet-400" />
          </div>
          <span className="text-sm font-medium text-white/90">
            AI Analysis
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!analysis && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-violet-400/80" />
            </div>
            <h3 className="text-sm font-medium text-white/80 mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6 max-w-[240px]">
              Use Claude AI to analyze this medical image. Get instant
              observations about modality, anatomy, and key findings.
            </p>
            <Button
              onClick={analyze}
              className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 border-0 text-white shadow-lg shadow-violet-500/20 rounded-xl px-6"
            >
              <Brain className="h-4 w-4" />
              Analyze Image
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
              <Brain className="h-5 w-5 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-zinc-400 mt-4">Analyzing image...</p>
            <p className="text-xs text-zinc-600 mt-1">
              This may take a few seconds
            </p>
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Analysis Failed
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">{error}</p>
                </div>
              </div>
              <Button
                onClick={analyze}
                variant="outline"
                size="sm"
                className="mt-3 w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="p-4">
            <div className="space-y-1">{renderAnalysis(analysis)}</div>

            {/* Regenerate */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <Button
                onClick={analyze}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="w-full text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg gap-2"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Regenerate Analysis
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-amber-500/[0.03]">
        <div className="flex gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500/60 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-500/50 leading-relaxed">
            AI analysis is for reference only. Not a medical diagnosis.
            Always consult qualified healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
