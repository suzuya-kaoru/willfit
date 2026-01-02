"use client";

import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTH_LABELS, WEEKDAY_LABELS } from "@/lib/schedule-utils";
import { formatTimeJST } from "@/lib/timezone";
import type { CalendarDay, WorkoutRecordWithStats } from "./types";

export interface CalendarViewProps {
  year: number;
  month: number;
  calendarDays: CalendarDay[];
  selectedDate: Date | null;
  selectedRecord: WorkoutRecordWithStats | null;
  onNavigateMonth: (direction: number) => void;
  onSelectDate: (date: Date) => void;
}

export function CalendarView({
  year,
  month,
  calendarDays,
  selectedDate,
  selectedRecord,
  onNavigateMonth,
  onSelectDate,
}: CalendarViewProps) {
  return (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onNavigateMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {year}年 {MONTH_LABELS[month]}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => onNavigateMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((day, i) => (
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

              const day = calendarDay.day;
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === month &&
                selectedDate?.getFullYear() === year;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => onSelectDate(new Date(year, month, day))}
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
                  {(calendarDay.record || calendarDay.isScheduled) &&
                    !isSelected && (
                      <span
                        className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                          calendarDay.record
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
        <SelectedDaySummary
          selectedDate={selectedDate}
          selectedRecord={selectedRecord}
        />
      )}
    </div>
  );
}

interface SelectedDaySummaryProps {
  selectedDate: Date;
  selectedRecord: WorkoutRecordWithStats | null;
}

function SelectedDaySummary({
  selectedDate,
  selectedRecord,
}: SelectedDaySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日（
          {WEEKDAY_LABELS[selectedDate.getDay()]}）
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedRecord ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{selectedRecord.menuName}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTimeJST(selectedRecord.startedAt)} -{" "}
                {selectedRecord.endedAt
                  ? formatTimeJST(selectedRecord.endedAt)
                  : "-"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/30 p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {selectedRecord.exerciseCount}
                </p>
                <p className="text-xs text-muted-foreground">種目</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {selectedRecord.setCount}
                </p>
                <p className="text-xs text-muted-foreground">セット</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {(selectedRecord.volume / 1000).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">ton</p>
              </div>
            </div>

            {selectedRecord.note && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  {selectedRecord.note}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            この日のワークアウトはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
