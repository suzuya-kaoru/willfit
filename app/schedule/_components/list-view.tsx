"use client";

import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/timezone";
import type { WorkoutSessionWithStats } from "./types";

export interface ListViewProps {
  sessions: WorkoutSessionWithStats[];
}

export function ListView({ sessions }: ListViewProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            まだトレーニング記録がありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="cursor-pointer transition-colors hover:bg-secondary/20"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{session.menuName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(session.startedAt, "M月d日")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {(session.volume / 1000).toFixed(1)} ton
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.exerciseCount}種目
                </p>
              </div>
            </div>
            {session.note && (
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {session.note}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
