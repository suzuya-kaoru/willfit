"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  List,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toDateKey } from "@/lib/date-key";
import { formatDateTime, formatTime } from "@/lib/timezone";
import type { WorkoutSession } from "@/lib/types";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

/**
 * カレンダーの日付情報
 */
export interface CalendarDay {
  day: number | null;
  dateString: string;
  session: WorkoutSessionWithStats | null;
  isScheduled: boolean;
  isToday: boolean;
}

/**
 * セッション統計情報付きセッション
 */
export interface WorkoutSessionWithStats extends WorkoutSession {
  menuName: string;
  volume: number;
  setCount: number;
  exerciseCount: number;
}

/**
 * History Client Component Props
 */
export interface HistoryClientProps {
  year: number;
  month: number;
  calendarDays: CalendarDay[];
  sessionsList: WorkoutSessionWithStats[];
  todayDateString: string;
}

/**
 * History Client Component
 * インタラクティブな操作（月移動、日付選択、タブ切り替え）を担当
 */
export function HistoryClient({
  year,
  month,
  calendarDays,
  sessionsList,
}: HistoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 月移動処理（URL パラメータを更新）
  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(newYear));
    params.set("month", String(newMonth + 1)); // 1-based for URL
    router.push(`/history?${params.toString()}`);
    setSelectedDate(null);
  };

  // 選択されたセッションを取得
  const selectedSession = selectedDate
    ? (() => {
        const selectedDateString = toDateKey(selectedDate);
        return (
          calendarDays.find((day) => day.dateString === selectedDateString)
            ?.session ?? null
        );
      })()
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="履歴" />

      <main className="mx-auto max-w-md p-4">
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              カレンダー
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              リスト
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {year}年 {MONTHS[month]}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-3">
                {/* Day Headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className={`py-2 text-center text-xs font-medium ${
                        i === 0
                          ? "text-destructive"
                          : i === 6
                            ? "text-info"
                            : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((calendarDay, index) => {
                    if (calendarDay.day === null) {
                      // biome-ignore lint/suspicious/noArrayIndexKey: 空セルは順番が変わらないため問題なし
                      return <div key={`empty-${index}`} className="h-10" />;
                    }

                    // null チェック後のため、day は number 型として扱える
                    const day = calendarDay.day;

                    const isSelected =
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === month &&
                      selectedDate?.getFullYear() === year;

                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() =>
                          setSelectedDate(new Date(year, month, day))
                        }
                        className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : calendarDay.isToday
                              ? "bg-secondary font-medium"
                              : "hover:bg-secondary/50"
                        }`}
                      >
                        {day}
                        {/* Status Dot */}
                        {(calendarDay.session || calendarDay.isScheduled) &&
                          !isSelected && (
                            <span
                              className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                                calendarDay.session
                                  ? "bg-primary"
                                  : "bg-muted-foreground/50"
                              }`}
                            />
                          )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Summary */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日（
                    {DAYS[selectedDate.getDay()]}）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Dumbbell className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">
                            {selectedSession.menuName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(selectedSession.startedAt)} -{" "}
                          {selectedSession.endedAt
                            ? formatTime(selectedSession.endedAt)
                            : "-"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/30 p-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">
                            {selectedSession.exerciseCount}
                          </p>
                          <p className="text-xs text-muted-foreground">種目</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">
                            {selectedSession.setCount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            セット
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">
                            {(selectedSession.volume / 1000).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">ton</p>
                        </div>
                      </div>

                      {selectedSession.note && (
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm text-muted-foreground">
                            {selectedSession.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      この日のトレーニング記録はありません
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            {sessionsList.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    まだトレーニング記録がありません
                  </p>
                </CardContent>
              </Card>
            ) : (
              sessionsList.map((session) => (
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
