"use client";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEKDAY_LABELS } from "@/lib/schedule-utils";
import type { SessionPlanWithExercises } from "@/lib/types";

export type PlanSelectionData = {
  sessionPlanId: number;
  type: "manual" | "weekly" | "interval";
  weekdays?: number; // bitmask
  intervalDays?: number;
};

interface PlanSelectionDialogProps {
  isOpen: boolean;
  plans: SessionPlanWithExercises[];
  onClose: () => void;
  onConfirm: (data: PlanSelectionData) => Promise<void>;
}

export function PlanSelectionDialog({
  isOpen,
  plans,
  onClose,
  onConfirm,
}: PlanSelectionDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<
    "manual" | "weekly" | "interval"
  >("manual");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPlanId) return;

    setIsSubmitting(true);
    try {
      let mask = 0;
      if (scheduleType === "weekly") {
        mask = weekdays.reduce((acc, sum) => acc + (1 << sum), 0);
      }

      await onConfirm({
        sessionPlanId: parseInt(selectedPlanId, 10),
        type: scheduleType,
        weekdays: scheduleType === "weekly" ? mask : undefined,
        intervalDays: scheduleType === "interval" ? intervalDays : undefined,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPlanId("");
    setScheduleType("manual");
    setWeekdays([]);
    setIntervalDays(2);
    onClose();
  };

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セッションをスケジュール</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>セッションを選択</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="セッションを選択" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>スケジュールの種類</Label>
            <RadioGroup
              value={scheduleType}
              onValueChange={(v) =>
                setScheduleType(v as "manual" | "weekly" | "interval")
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">単発 (選択中の日付に追加)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">毎週 (曜日指定)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interval" id="interval" />
                <Label htmlFor="interval">間隔 (N日ごと)</Label>
              </div>
            </RadioGroup>
          </div>

          {scheduleType === "weekly" && (
            <div className="space-y-2">
              <Label>曜日を選択</Label>
              <div className="flex gap-2">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleWeekday(i)}
                    className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                      weekdays.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scheduleType === "interval" && (
            <div className="space-y-2">
              <Label>間隔日数</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={intervalDays}
                  onChange={(e) =>
                    setIntervalDays(parseInt(e.target.value, 10) || 1)
                  }
                  className="w-20"
                />
                <span className="text-sm">日ごと</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedPlanId ||
              isSubmitting ||
              (scheduleType === "weekly" && weekdays.length === 0)
            }
          >
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
