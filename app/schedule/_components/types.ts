import type { CalculatedTask, WorkoutRecord } from "@/lib/types";

/**
 * カレンダーの日付情報
 */
export interface CalendarDay {
  day: number | null;
  dateString: string;
  record: WorkoutRecordWithStats | null;
  schedules: CalculatedTask[];
  isScheduled: boolean;
  isToday: boolean;
}

/**
 * トレーニング記録統計情報付き
 */
export interface WorkoutRecordWithStats extends WorkoutRecord {
  menuName: string;
  volume: number;
  setCount: number;
  exerciseCount: number;
}

/**
 * 日付選択ダイアログのProps
 */
export interface ScheduleDayDialogProps {
  isOpen: boolean;
  date: Date | null;
  record: WorkoutRecordWithStats | null;
  schedules: CalculatedTask[];
  onClose: () => void;
  onComplete: (id: number) => Promise<void>;
  onSkip: (id: number) => Promise<void>;
  onReschedule: (id: number) => void;
  onAddPlan: () => void;
  onStartWorkout?: (taskId: number, planId: number, menuId: number) => void;
}
