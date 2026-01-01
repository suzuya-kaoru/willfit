import type { RoutineType } from "@/lib/types";

export type TodayScheduleViewModel = {
  routineId: number;
  menuId: number;
  menuName: string;
  routineType: RoutineType;
  isFromReschedule: boolean;
};

export type DailySchedulesViewModel = {
  dateKey: string;
  label: string;
  isToday: boolean;
  dayOfWeek: number;
  formattedDate: string;
  schedules: TodayScheduleViewModel[];
};

export type WeekDayStatus = {
  dateString: string;
  dayOfWeekIndex: number;
  status: "completed" | "incomplete" | "none"; // 'completed' = 全て完了, 'incomplete' = 残りあり, 'none' = 予定なし
  isToday: boolean;
  hasSchedule: boolean;
};
