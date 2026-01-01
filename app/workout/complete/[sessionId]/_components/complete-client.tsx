"use client";

import {
  CheckCircle,
  Clock,
  Dumbbell,
  Edit,
  Home,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkoutSessionWithDetails } from "@/lib/db/queries";

export interface CompleteClientProps {
  session: WorkoutSessionWithDetails;
  summary: {
    totalSets: number;
    completedSets: number;
    totalVolume: number;
    duration: number;
  };
}

export function CompleteClient({ session, summary }: CompleteClientProps) {
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}時間${m}分`;
    }
    if (m > 0) {
      return `${m}分${s}秒`;
    }
    return `${s}秒`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  };

  const completionRate = summary.totalSets
    ? Math.round((summary.completedSets / summary.totalSets) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4">
          <h1 className="text-lg font-semibold">トレーニング完了</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 p-4">
        {/* Success Icon */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">お疲れ様でした！</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(session.startedAt)} • {session.menu.name}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatDuration(summary.duration)}
              </span>
              <span className="text-xs text-muted-foreground">
                トレーニング時間
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {summary.completedSets}/{summary.totalSets}
              </span>
              <span className="text-xs text-muted-foreground">完了セット</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {summary.totalVolume.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                総ボリューム(kg)
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{completionRate}%</span>
              <span className="text-xs text-muted-foreground">完了率</span>
            </CardContent>
          </Card>
        </div>

        {/* Session Details */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-base font-medium">セッション詳細</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Condition & Fatigue */}
            <div className="flex gap-4">
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">体調</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${session.condition * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {session.condition}/10
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">疲労感</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${session.fatigue * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {session.fatigue}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            {session.note && (
              <div>
                <span className="text-sm text-muted-foreground">メモ</span>
                <p className="mt-1 text-sm">{session.note}</p>
              </div>
            )}

            {/* Exercise List */}
            <div>
              <span className="text-sm text-muted-foreground">種目</span>
              <ul className="mt-2 space-y-2">
                {session.exerciseRecords.map((er) => {
                  const completedCount = er.sets.filter(
                    (s) => s.completed,
                  ).length;
                  const maxWeight = Math.max(...er.sets.map((s) => s.weight));
                  return (
                    <li
                      key={er.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {er.exercise.name}
                        </span>
                        <div className="flex gap-1">
                          {er.exercise.bodyParts.slice(0, 2).map((part) => (
                            <span
                              key={part.id}
                              className="rounded bg-secondary px-1.5 py-0.5 text-xs"
                            >
                              {part.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>
                          {completedCount}/{er.sets.length}セット
                        </div>
                        {maxWeight > 0 && <div>最大 {maxWeight}kg</div>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <Button asChild className="w-full gap-2" size="lg">
            <Link href="/">
              <Home className="h-5 w-5" />
              ホームに戻る
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full gap-2" size="lg">
            <Link href={`/workout/${session.menu.id}/edit/${session.id}`}>
              <Edit className="h-5 w-5" />
              記録を編集（再開）
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
