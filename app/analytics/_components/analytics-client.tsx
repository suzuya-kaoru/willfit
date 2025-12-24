"use client";

import { Dumbbell, Scale, TrendingUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/timezone";
import type { ExerciseWithBodyParts } from "@/lib/types";

// =============================================================================
// 型定義
// =============================================================================

export type Period = "1m" | "3m" | "1y";
export type Metric = "weight" | "1rm" | "volume";

export interface WeightDataPoint {
  date: string;
  weight: number;
}

export interface ExerciseDataPoint {
  date: string;
  weight: number;
  "1rm": number;
  volume: number;
}

export interface PersonalBest {
  id: number;
  exerciseName: string;
  weight: number;
  date: string;
}

export interface AnalyticsClientProps {
  allExercises: ExerciseWithBodyParts[];
  allWeightRecords: Array<{
    recordedAt: Date;
    weight: number;
  }>;
  exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]>;
  personalBests: PersonalBest[];
}

// =============================================================================
// Client Component: インタラクティブなUIとチャート描画
// =============================================================================

export function AnalyticsClient({
  allExercises,
  allWeightRecords,
  exerciseDataByExerciseId,
  personalBests,
}: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"body" | "exercise">("body");
  const [weightPeriod, setWeightPeriod] = useState<Period>("3m");
  const [selectedExercise, setSelectedExercise] = useState<number | undefined>(
    allExercises[0]?.id,
  );
  const [selectedMetric, setSelectedMetric] = useState<Metric>("weight");

  // Filter weight data by period (クライアント側でフィルタリング)
  const weightData = useMemo(() => {
    const now = new Date();
    const periodDays =
      weightPeriod === "1m" ? 30 : weightPeriod === "3m" ? 90 : 365;
    const cutoffDate = new Date(
      now.getTime() - periodDays * 24 * 60 * 60 * 1000,
    );

    return allWeightRecords
      .filter((r) => new Date(r.recordedAt) >= cutoffDate)
      .map((r) => ({
        date: formatDateTime(r.recordedAt, "M/d"),
        weight: r.weight,
      }));
  }, [weightPeriod, allWeightRecords]);

  // Filter exercise data by selected exercise (クライアント側でフィルタリング)
  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    return exerciseDataByExerciseId[selectedExercise] ?? [];
  }, [selectedExercise, exerciseDataByExerciseId]);

  const currentExercise = allExercises.find((e) => e.id === selectedExercise);

  // Chart colors
  const chartColor = "#4ade80"; // primary green

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="分析" />

      <main className="mx-auto max-w-md p-4">
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

          {/* Body Composition Tab */}
          <TabsContent value="body" className="space-y-4">
            {/* Period Filter */}
            <div className="flex gap-2">
              {(["1m", "3m", "1y"] as const).map((period) => (
                <button
                  type="button"
                  key={period}
                  onClick={() => setWeightPeriod(period)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    weightPeriod === period
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {period === "1m"
                    ? "1ヶ月"
                    : period === "3m"
                      ? "3ヶ月"
                      : "1年"}
                </button>
              ))}
            </div>

            {/* Weight Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">体重推移</CardTitle>
                  {weightData.length > 1 && (
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp
                        className={`h-4 w-4 ${
                          weightData[weightData.length - 1].weight <
                          weightData[0].weight
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      />
                      <span
                        className={
                          weightData[weightData.length - 1].weight <
                          weightData[0].weight
                            ? "text-primary"
                            : "text-destructive"
                        }
                      >
                        {(
                          weightData[weightData.length - 1].weight -
                          weightData[0].weight
                        ).toFixed(1)}{" "}
                        kg
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {weightData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weightData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="weightGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={chartColor}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={chartColor}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#888" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={["dataMin - 1", "dataMax + 1"]}
                          tick={{ fontSize: 11, fill: "#888" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#888" }}
                          itemStyle={{ color: chartColor }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke={chartColor}
                          fill="url(#weightGradient)"
                          strokeWidth={2}
                          name="体重"
                          unit=" kg"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    データがありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Stats */}
            {weightData.length > 0 && (
              <Card>
                <CardContent className="grid grid-cols-3 gap-4 p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {weightData[weightData.length - 1].weight}
                    </p>
                    <p className="text-xs text-muted-foreground">現在 (kg)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.min(...weightData.map((d) => d.weight))}
                    </p>
                    <p className="text-xs text-muted-foreground">最低 (kg)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.max(...weightData.map((d) => d.weight))}
                    </p>
                    <p className="text-xs text-muted-foreground">最高 (kg)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Exercise Progress Tab */}
          <TabsContent value="exercise" className="space-y-4">
            {/* Exercise Selector */}
            <Select
              value={selectedExercise?.toString()}
              onValueChange={(v) => setSelectedExercise(parseInt(v, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="種目を選択" />
              </SelectTrigger>
              <SelectContent>
                {allExercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id.toString()}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Metric Selector */}
            <div className="flex gap-2">
              {[
                { key: "weight" as const, label: "使用重量" },
                { key: "1rm" as const, label: "推定1RM" },
                { key: "volume" as const, label: "総ボリューム" },
              ].map((metric) => (
                <button
                  type="button"
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    selectedMetric === metric.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>

            {/* Exercise Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {currentExercise?.name} -{" "}
                  {selectedMetric === "weight"
                    ? "使用重量"
                    : selectedMetric === "1rm"
                      ? "推定1RM"
                      : "総ボリューム"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exerciseData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={exerciseData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#888" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#888" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#888" }}
                          itemStyle={{ color: chartColor }}
                        />
                        <Line
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke={chartColor}
                          strokeWidth={2}
                          dot={{ fill: chartColor, strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, fill: chartColor }}
                          name={
                            selectedMetric === "weight"
                              ? "重量"
                              : selectedMetric === "1rm"
                                ? "1RM"
                                : "ボリューム"
                          }
                          unit={selectedMetric === "volume" ? " kg" : " kg"}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    この種目のデータがありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Personal Bests */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-warning" />
                  自己ベスト
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {personalBests.length > 0 ? (
                  personalBests.map((pb) => (
                    <div
                      key={pb.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <span className="text-sm font-medium">
                        {pb.exerciseName}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          {pb.weight} kg
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(pb.date, "M/d")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    記録がありません
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
