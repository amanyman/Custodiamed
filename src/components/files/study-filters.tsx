"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

const MODALITY_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "MRI", label: "MRI" },
  { value: "CT", label: "CT Scan" },
  { value: "X-Ray", label: "X-Ray" },
  { value: "Ultrasound", label: "Ultrasound" },
  { value: "PET", label: "PET Scan" },
  { value: "Mammogram", label: "Mammogram" },
  { value: "Other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "size-desc", label: "Largest First" },
  { value: "size-asc", label: "Smallest First" },
];

export function StudyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const modality = searchParams.get("modality") || "all";
  const sort = searchParams.get("sort") || "date-desc";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all" && value !== "date-desc") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("?");
  };

  const hasFilters = search || modality !== "all" || sort !== "date-desc";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search studies..."
          value={search}
          onChange={(e) => updateParams("search", e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <Select value={modality} onValueChange={(v) => updateParams("modality", v)}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder="Filter type" />
        </SelectTrigger>
        <SelectContent>
          {MODALITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => updateParams("sort", v)}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 shrink-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
