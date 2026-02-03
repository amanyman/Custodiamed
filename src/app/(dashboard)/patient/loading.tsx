import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDashboardLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-72 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Steps Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-soft overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 md:p-8 md:w-16 flex items-center justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="p-6 md:p-8 flex-1 space-y-4">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
