export type TodayScheduleViewModel = {
  taskId: number;
  workoutSessionId: number;
  templateId: number;
  templateName: string;
  ruleType?: "weekly" | "interval" | "once";
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
