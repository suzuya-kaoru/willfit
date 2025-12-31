import type { ExerciseWithBodyParts } from "@/lib/types";

export type ScheduleReminderViewModel = {
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  startDateKey: string;
  isEnabled: boolean;
};

export type TodayScheduleViewModel = {
  scheduleId: number;
  menuId: number;
  menuName: string;
  exercises: ExerciseWithBodyParts[];
  previousNote: string | null;
  reminder: ScheduleReminderViewModel | null;
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

export type ReminderTarget = {
  scheduleId: number;
  menuName: string;
  dateKey: string;
  dayOfWeek: number;
  reminder: ScheduleReminderViewModel | null;
};

export type ReminderFormState = {
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  startDateKey: string;
  dayOfWeek: string;
  dayOfMonth: string;
  isEnabled: boolean;
};
