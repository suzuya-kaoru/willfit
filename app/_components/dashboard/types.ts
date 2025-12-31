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
  schedules: TodayScheduleViewModel[];
};

export type WeekDayStatus = {
  dateString: string;
  dayOfWeekIndex: number;
  isCompleted: boolean;
  isToday: boolean;
  hasSchedule: boolean;
};
