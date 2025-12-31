import type { WorkoutSession } from "@/lib/types";

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
