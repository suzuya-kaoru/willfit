"use client";

import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/timezone";
import type { Period } from "./types";

export interface BodyCompositionTabProps {
  allWeightRecords: Array<{
    recordedAt: Date;
    weight: number;
  }>;
}

export function BodyCompositionTab({
  allWeightRecords,
}: BodyCompositionTabProps) {
  const [weightPeriod, setWeightPeriod] = useState<Period>("3m");

  // Filter weight data by period
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

  const chartColor = "#4ade80";

  return (
    <div className="space-y-4">
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
            {period === "1m" ? "1ヶ月" : period === "3m" ? "3ヶ月" : "1年"}
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
    </div>
  );
}
