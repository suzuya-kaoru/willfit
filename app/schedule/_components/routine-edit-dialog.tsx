"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateKey } from "@/lib/date-key";
import {
  bitmaskFromWeekdays,
  weekdaysFromBitmask,
} from "@/lib/schedule-utils";
import type { RoutineEditDialogProps, RoutineFormData } from "./types";

const WEEKDAYS = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
];

export function RoutineEditDialog({
  isOpen,
  routine,
  menus,
  onClose,
  onSave,
  onDelete,
}: RoutineEditDialogProps) {
  const [menuId, setMenuId] = useState<number | null>(null);
  const [routineType, setRoutineType] = useState<"weekly" | "interval">(
    "weekly",
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState<number>(3);
  const [startDateKey, setStartDateKey] = useState<string>(
    toDateKey(new Date()),
  );
  const [isPending, setIsPending] = useState(false);

  // ダイアログが開かれたときにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      if (routine) {
        setMenuId(routine.menuId);
        setRoutineType(routine.routineType);
        if (routine.weekdays != null) {
          setSelectedWeekdays(weekdaysFromBitmask(routine.weekdays));
        } else {
          setSelectedWeekdays([]);
        }
        setIntervalDays(routine.intervalDays ?? 3);
        setStartDateKey(
          routine.startDate ? toDateKey(routine.startDate) : toDateKey(new Date()),
        );
      } else {
        setMenuId(menus[0]?.id ?? null);
        setRoutineType("weekly");
        setSelectedWeekdays([]);
        setIntervalDays(3);
        setStartDateKey(toDateKey(new Date()));
      }
    }
  }, [isOpen, routine, menus]);

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    if (menuId == null) return;

    const data: RoutineFormData = {
      menuId,
      routineType,
    };

    if (routineType === "weekly") {
      if (selectedWeekdays.length === 0) return;
      data.weekdays = bitmaskFromWeekdays(selectedWeekdays);
    } else {
      data.intervalDays = intervalDays;
      data.startDateKey = startDateKey;
    }

    setIsPending(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!routine || !onDelete) return;
    setIsPending(true);
    try {
      await onDelete(routine.id);
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  const isValid =
    menuId != null &&
    (routineType === "weekly"
      ? selectedWeekdays.length > 0
      : intervalDays > 0 && startDateKey);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {routine ? "ルーティンを編集" : "ルーティンを追加"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* メニュー選択 */}
          <div className="space-y-2">
            <Label>メニュー</Label>
            <Select
              value={menuId?.toString() ?? ""}
              onValueChange={(val) => setMenuId(Number(val))}
              disabled={routine != null}
            >
              <SelectTrigger>
                <SelectValue placeholder="メニューを選択" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id.toString()}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ルーティン種別 */}
          <div className="space-y-2">
            <Label>種別</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={routineType === "weekly" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRoutineType("weekly")}
              >
                曜日ベース
              </Button>
              <Button
                type="button"
                variant={routineType === "interval" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRoutineType("interval")}
              >
                間隔ベース
              </Button>
            </div>
          </div>

          {/* 曜日選択 */}
          {routineType === "weekly" && (
            <div className="space-y-2">
              <Label>曜日を選択</Label>
              <div className="flex justify-between gap-1">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      selectedWeekdays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 間隔設定 */}
          {routineType === "interval" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>間隔（日）</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">日ごと</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>起点日</Label>
                <Input
                  type="date"
                  value={startDateKey}
                  onChange={(e) => setStartDateKey(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2">
          {routine && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="mr-auto"
            >
              削除
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isPending || !isValid}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
