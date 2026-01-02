"use client";

import { addDays, subDays } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toDateKey } from "@/lib/date-key";
import { formatDateJaWithWeekday } from "@/lib/timezone";
import type { CalculatedTask } from "@/lib/types";

interface RescheduleDialogProps {
  isOpen: boolean;
  schedule: CalculatedTask | null;
  fromDate: Date | null;
  onClose: () => void;
  onConfirm: (toDate: Date) => Promise<void>;
}

export function RescheduleDialog({
  isOpen,
  schedule,
  fromDate,
  onClose,
  onConfirm,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  if (!schedule || !fromDate) return null;

  // 前後5日の候補日
  const candidateDates = [-2, -1, 1, 2, 3, 4, 5]
    .map((offset) =>
      offset < 0 ? subDays(fromDate, -offset) : addDays(fromDate, offset),
    )
    .filter((date) => date.getTime() !== fromDate.getTime());

  const handleQuickSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleCalendarChange = (dateString: string) => {
    setCalendarDate(dateString);
    if (dateString) {
      setSelectedDate(new Date(dateString));
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate) return;
    setIsPending(true);
    try {
      await onConfirm(selectedDate);
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  const formatQuickDate = (date: Date) => {
    return formatDateJaWithWeekday(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] rounded-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>振替先を選択</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 振替元情報 */}
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="font-medium">{schedule.menuName}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateJaWithWeekday(fromDate)} → ?
            </p>
          </div>

          {/* クイック選択 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">日付を選択</p>
            <div className="flex flex-wrap gap-2">
              {candidateDates.map((date) => {
                const isSelected =
                  selectedDate && toDateKey(selectedDate) === toDateKey(date);
                return (
                  <Button
                    key={toDateKey(date)}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickSelect(date)}
                  >
                    {formatQuickDate(date)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* カレンダー選択 */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              カレンダーから選択
            </Button>

            {showCalendar && (
              <Input
                type="date"
                value={calendarDate}
                onChange={(e) => handleCalendarChange(e.target.value)}
                min={toDateKey(new Date())}
              />
            )}
          </div>

          {/* 選択結果 */}
          {selectedDate && (
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-sm text-muted-foreground">振替先</p>
              <p className="text-lg font-bold text-primary">
                {formatDateJaWithWeekday(selectedDate)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !selectedDate}>
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
