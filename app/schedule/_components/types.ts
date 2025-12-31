import type {
  CalculatedSchedule,
  ScheduleRoutine,
  WorkoutMenu,
  WorkoutSession,
} from "@/lib/types";

/**
 * カレンダーの日付情報
 */
export interface CalendarDay {
  day: number | null;
  dateString: string;
  session: WorkoutSessionWithStats | null;
  schedules: CalculatedSchedule[];
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
 * ルーティン設定ダイアログのProps
 */
export interface RoutineEditDialogProps {
  isOpen: boolean;
  routine: ScheduleRoutine | null;
  menus: WorkoutMenu[];
  onClose: () => void;
  onSave: (data: RoutineFormData) => Promise<void>;
  onDelete?: (routineId: number) => Promise<void>;
}

/**
 * ルーティン設定フォームデータ
 */
export interface RoutineFormData {
  menuId: number;
  routineType: "weekly" | "interval";
  weekdays?: number;
  intervalDays?: number;
  startDateKey?: string;
}

/**
 * 振替ダイアログのProps
 */
export interface RescheduleDialogProps {
  isOpen: boolean;
  schedule: CalculatedSchedule | null;
  fromDate: Date | null;
  onClose: () => void;
  onConfirm: (toDate: Date) => Promise<void>;
}

/**
 * 日付選択ダイアログのProps
 */
export interface ScheduleDayDialogProps {
  isOpen: boolean;
  date: Date | null;
  session: WorkoutSessionWithStats | null;
  schedules: CalculatedSchedule[];
  onClose: () => void;
  onComplete: (routineId: number) => Promise<void>;
  onSkip: (routineId: number) => Promise<void>;
  onReschedule: (routineId: number) => void;
  onCreateRoutine: () => void;
}
