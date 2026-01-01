import type { CalculatedTask, WorkoutSession } from "@/lib/types";

/**
 * カレンダーの日付情報
 */
export interface CalendarDay {
  day: number | null;
  dateString: string;
  session: WorkoutSessionWithStats | null;
  schedules: CalculatedTask[];
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
 * 日付選択ダイアログのProps
 */
export interface ScheduleDayDialogProps {
  isOpen: boolean;
  date: Date | null;
  session: WorkoutSessionWithStats | null;
  schedules: CalculatedTask[];
  onClose: () => void;
  onComplete: (id: number) => Promise<void>;
  onSkip: (id: number) => Promise<void>;
  onReschedule: (id: number) => void;
  onAddPlan: () => void;
}
