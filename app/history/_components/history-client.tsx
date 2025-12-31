"use client";

import { Calendar, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toDateKey } from "@/lib/date-key";
import { CalendarView } from "./calendar-view";
import { ListView } from "./list-view";
import type { CalendarDay, WorkoutSessionWithStats } from "./types";

// 型を再エクスポート（後方互換性のため）
export type { CalendarDay, WorkoutSessionWithStats };

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

          <TabsContent value="calendar">
            <CalendarView
              year={year}
              month={month}
              calendarDays={calendarDays}
              selectedDate={selectedDate}
              selectedSession={selectedSession}
              onNavigateMonth={navigateMonth}
              onSelectDate={setSelectedDate}
            />
          </TabsContent>

          <TabsContent value="list">
            <ListView sessions={sessionsList} />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
