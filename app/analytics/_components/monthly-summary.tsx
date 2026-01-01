"use client";

import { Dumbbell, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MonthlySummaryProps {
  totalVolume: number; // kg
  workoutCount: number;
}

export function MonthlySummary({
  totalVolume,
  workoutCount,
}: MonthlySummaryProps) {
  // フォーマット: 1000kg以上はton表示
  const volumeDisplay =
    totalVolume >= 1000
      ? { value: (totalVolume / 1000).toFixed(1), unit: "ton" }
      : { value: totalVolume.toLocaleString(), unit: "kg" };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Volume Cart */}
      <Card className="overflow-hidden border-none bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-sm">
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Dumbbell className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Volume
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight">
              {volumeDisplay.value}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {volumeDisplay.unit}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            今月の総負荷量
          </p>
          {/* Decorative element */}
          <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary/5 blur-xl" />
        </CardContent>
      </Card>

      {/* Workout Count Card */}
      <Card className="overflow-hidden border-none bg-linear-to-br from-orange-500/10 via-orange-500/5 to-background shadow-sm">
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-2 mb-2 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Workouts
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight">
              {workoutCount}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              sess
            </span>
          </div>
          {/* Mockup for "Streak" or similar - simple text for now */}
          <div className="flex items-center gap-1 mt-1">
            {workoutCount > 0 ? (
              <span className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                Good Pace!
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                Let's start!
              </span>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-orange-500/5 blur-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
