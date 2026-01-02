"use client";

import { Plus, Scale } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/timezone";
import type { Period } from "./types";
import { WeightInputDialog } from "./weight-input-dialog";

export interface BodyCompositionTabProps {
  allWeightRecords: Array<{
    recordedAt: Date;
    weight: number;
    bodyFat?: number;
  }>;
}

export function BodyCompositionTab({
  allWeightRecords,
}: BodyCompositionTabProps) {
  const [weightPeriod, setWeightPeriod] = useState<Period>("3m");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter and sort weight data by period
  const weightData = useMemo(() => {
    const now = new Date();
    const periodDays =
      weightPeriod === "1m" ? 30 : weightPeriod === "3m" ? 90 : 365;
    const cutoffDate = new Date(
      now.getTime() - periodDays * 24 * 60 * 60 * 1000,
    );

    return allWeightRecords
      .filter((r) => new Date(r.recordedAt) >= cutoffDate)
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      )
      .map((r) => ({
        date: formatDateTime(r.recordedAt, "M/d"),
        weight: r.weight,
        bodyFat: r.bodyFat,
      }));
  }, [weightPeriod, allWeightRecords]);

  const latestRecord = allWeightRecords.at(-1);

  // Find the latest body fat from history to inherit as default
  const lastKnownBodyFat = useMemo(() => {
    // If we have a current record with body fat, use it (editing today's record)
    if (latestRecord?.bodyFat != null) return latestRecord.bodyFat;

    // Otherwise search backwards for the last known body fat
    // (copy array before reversing to avoid mutating props)
    return [...allWeightRecords].reverse().find((r) => r.bodyFat != null)
      ?.bodyFat;
  }, [allWeightRecords, latestRecord]);

  const currentWeight = latestRecord?.weight;
  const currentBodyFat = lastKnownBodyFat;

  const chartColorWeight = "#4ade80"; // Green
  const chartColorBodyFat = "#facc15"; // Yellow

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex gap-2">
        {/* Period Filter */}
        <div className="flex flex-1 gap-1 bg-secondary/20 p-1 rounded-lg">
          {(["1m", "3m", "1y"] as const).map((period) => (
            <button
              type="button"
              key={period}
              onClick={() => setWeightPeriod(period)}
              className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                weightPeriod === period
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {period === "1m" ? "1ヶ月" : period === "3m" ? "3ヶ月" : "1年"}
            </button>
          ))}
        </div>

        {/* Record Button */}
        <Button
          size="sm"
          className="gap-1 shadow-md shadow-primary/20"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          記録
        </Button>
      </div>

      {/* Body Composition Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Body Composition
            </CardTitle>
            {weightData.length > 1 && (
              <div className="flex items-center gap-3 text-sm">
                {/* Weight Trend */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
                {/* Body Fat Trend */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weightData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
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
                        stopColor={chartColorWeight}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColorWeight}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />

                  {/* Weight Axis (Left) */}
                  <YAxis
                    yAxisId="left"
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />

                  {/* Body Fat Axis (Right) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[5, 40]} // Reasonable range for body fat
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                    hide={!weightData.some((d) => d.bodyFat)}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#888", marginBottom: "4px" }}
                    itemStyle={{ padding: 0 }}
                    cursor={{ stroke: "#666", strokeWidth: 1 }}
                  />

                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke={chartColorWeight}
                    fill="url(#weightGradient)"
                    strokeWidth={2}
                    name="体重"
                    unit=" kg"
                  />

                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyFat"
                    stroke={chartColorBodyFat}
                    strokeWidth={2}
                    dot={{ fill: chartColorBodyFat, r: 2, strokeWidth: 0 }}
                    activeDot={{ r: 4, stroke: chartColorBodyFat }}
                    name="体脂肪率"
                    unit=" %"
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              データがありません。
              <br />
              「記録」ボタンから体重を入力しましょう。
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Stats Grid */}
      {latestRecord && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">現在の体重</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold">
                  {latestRecord.weight.toFixed(1)}
                </span>
                <span className="text-sm">kg</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">体脂肪率</p>
              <div className="flex items-baseline justify-center gap-1">
                {latestRecord.bodyFat ? (
                  <>
                    <span className="text-2xl font-bold">
                      {latestRecord.bodyFat.toFixed(1)}
                    </span>
                    <span className="text-sm">%</span>
                  </>
                ) : (
                  <span className="text-xl text-muted-foreground">-</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <WeightInputDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentWeight={currentWeight}
        currentBodyFat={currentBodyFat}
      />
    </div>
  );
}
