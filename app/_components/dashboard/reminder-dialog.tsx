"use client";

import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import type { ReminderFormState, ReminderTarget } from "./types";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

interface ReminderDialogProps {
  // target が null の場合はダイアログを閉じる
  target: ReminderTarget | null;
  onOpenChange: (open: boolean) => void;
  onSave: (target: ReminderTarget, form: ReminderFormState) => void;
  onDelete: (target: ReminderTarget) => void;
  isPending: boolean;
}

export function ReminderDialog({
  target,
  onOpenChange,
  onSave,
  onDelete,
  isPending,
}: ReminderDialogProps) {
  const [form, setForm] = React.useState<ReminderFormState | null>(null);

  // target変更時にフォームを初期化
  React.useEffect(() => {
    if (!target) {
      setForm(null);
      return;
    }

    const reminder = target.reminder;
    const defaultDayOfMonth = Number.parseInt(
      target.dateKey.split("-")[2] ?? "1",
      10,
    );

    setForm({
      frequency: reminder?.frequency ?? "weekly",
      timeOfDay: reminder?.timeOfDay ?? "19:00",
      startDateKey: reminder?.startDateKey ?? target.dateKey,
      dayOfWeek: String(
        typeof reminder?.dayOfWeek === "number"
          ? reminder.dayOfWeek
          : target.dayOfWeek,
      ),
      dayOfMonth: String(
        typeof reminder?.dayOfMonth === "number"
          ? reminder.dayOfMonth
          : Number.isNaN(defaultDayOfMonth)
            ? 1
            : defaultDayOfMonth,
      ),
      isEnabled: reminder?.isEnabled ?? true,
    });
  }, [target]);

  const handleSave = () => {
    if (!target || !form) return;
    onSave(target, form);
  };

  const handleDelete = () => {
    if (!target) return;
    onDelete(target);
  };

  if (!target) return null;

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>リマインド設定</DialogTitle>
        </DialogHeader>
        {form && (
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {target.menuName}
              </p>
              <p className="text-xs text-muted-foreground">
                スケジュールに合わせて通知を設定します
              </p>
            </div>

            <div className="space-y-2">
              <Label>頻度</Label>
              <Select
                value={form.frequency}
                onValueChange={(value) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          frequency: value as ReminderFormState["frequency"],
                        }
                      : prev,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="頻度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                  <SelectItem value="monthly">毎月</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>時刻</Label>
                <Input
                  type="time"
                  value={form.timeOfDay}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, timeOfDay: event.target.value } : prev,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>開始日</Label>
                <Input
                  type="date"
                  value={form.startDateKey}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, startDateKey: event.target.value }
                        : prev,
                    )
                  }
                />
              </div>
            </div>

            {form.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>曜日</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, dayOfWeek: value } : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="曜日を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayLabels.map((label, index) => (
                      <SelectItem key={label} value={String(index)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.frequency === "monthly" && (
              <div className="space-y-2">
                <Label>日付</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={form.dayOfMonth}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, dayOfMonth: event.target.value } : prev,
                    )
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <Label className="text-sm">リマインドを有効化</Label>
                <p className="text-xs text-muted-foreground">
                  次回通知のスケジュールを更新します
                </p>
              </div>
              <Switch
                checked={form.isEnabled}
                onCheckedChange={(value) =>
                  setForm((prev) =>
                    prev ? { ...prev, isEnabled: value } : prev,
                  )
                }
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-3">
          {target.reminder && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isPending}
            >
              削除
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!form || isPending}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
