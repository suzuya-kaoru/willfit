"use client";

import { Dumbbell, Scale } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyCompositionTab } from "./body-composition-tab";
import { ExerciseProgressTab } from "./exercise-progress-tab";
import { MonthlySummary } from "./monthly-summary";
import type {
  AnalyticsClientProps,
  ExerciseDataPoint,
  Metric,
  Period,
  PersonalBest,
  WeightDataPoint,
} from "./types";

// 型を再エクスポート（後方互換性のため）
export type {
  AnalyticsClientProps,
  ExerciseDataPoint,
  Metric,
  Period,
  PersonalBest,
  WeightDataPoint,
};

/**
 * Analytics Client Component
 * インタラクティブなUIとチャート描画を担当
 */
export function AnalyticsClient({
  allExercises,
  allWeightRecords,
  exerciseDataByExerciseId,
  personalBests,
  monthlyStats,
}: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"body" | "exercise">("body");

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="分析" />

      <main className="mx-auto max-w-md px-4 pt-2 pb-4 space-y-6">
        {/* Monthly Summary */}
        <section>
          <h2 className="text-sm font-semibold mb-2 ml-1 text-muted-foreground">
            今月のハイライト
          </h2>
          <MonthlySummary
            totalVolume={monthlyStats.totalVolume}
            workoutCount={monthlyStats.workoutCount}
          />
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "body" | "exercise")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body" className="gap-2">
              <Scale className="h-4 w-4" />
              体重・体組成
            </TabsTrigger>
            <TabsTrigger value="exercise" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              種目別成長
            </TabsTrigger>
          </TabsList>

          <TabsContent value="body">
            <BodyCompositionTab allWeightRecords={allWeightRecords} />
          </TabsContent>

          <TabsContent value="exercise">
            <ExerciseProgressTab
              allExercises={allExercises}
              exerciseDataByExerciseId={exerciseDataByExerciseId}
              personalBests={personalBests}
            />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
