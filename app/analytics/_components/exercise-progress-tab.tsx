"use client";

import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/timezone";
import type { ExerciseWithBodyParts } from "@/lib/types";
import type { ExerciseDataPoint, Metric, PersonalBest } from "./types";

export interface ExerciseProgressTabProps {
  allExercises: ExerciseWithBodyParts[];
  exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]>;
  personalBests: PersonalBest[];
}

export function ExerciseProgressTab({
  allExercises,
  exerciseDataByExerciseId,
  personalBests,
}: ExerciseProgressTabProps) {
  const [selectedExercise, setSelectedExercise] = useState<number | undefined>(
    allExercises[0]?.id,
  );
  const [selectedMetric, setSelectedMetric] = useState<Metric>("weight");

  // Filter exercise data by selected exercise
  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    return exerciseDataByExerciseId[selectedExercise] ?? [];
  }, [selectedExercise, exerciseDataByExerciseId]);

  const currentExercise = allExercises.find((e) => e.id === selectedExercise);
  const chartColor = "#4ade80";

  return (
    <div className="space-y-4">
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
                <span className="text-sm font-medium">{pb.exerciseName}</span>
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
    </div>
  );
}
