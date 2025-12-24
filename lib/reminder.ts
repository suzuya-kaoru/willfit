import {
  addDays,
  addMonths,
  addWeeks,
  getDate,
  getDay,
  lastDayOfMonth,
  set,
} from "date-fns";
import type { ReminderFrequency } from "./types";

type ReminderRule = {
  frequency: ReminderFrequency;
  timeOfDay: string;
  startDate: Date;
  dayOfWeek?: number;
  dayOfMonth?: number;
  endDate?: Date;
};

function withTime(base: Date, timeOfDay: string): Date {
  const [hours, minutes] = timeOfDay.split(":").map((value) => Number(value));
  return set(base, { hours, minutes, seconds: 0, milliseconds: 0 });
}

export function calcNextReminderAt(
  rule: ReminderRule,
  now = new Date(),
): Date | null {
  let candidate = withTime(
    rule.startDate > now ? rule.startDate : now,
    rule.timeOfDay,
  );

  if (rule.frequency === "daily") {
    if (candidate <= now || candidate < rule.startDate) {
      candidate = addDays(candidate, 1);
    }
  }

  if (rule.frequency === "weekly") {
    const targetDow =
      typeof rule.dayOfWeek === "number"
        ? rule.dayOfWeek
        : getDay(rule.startDate);
    const diff = (targetDow - getDay(candidate) + 7) % 7;
    candidate = addDays(candidate, diff);
    if (candidate <= now || candidate < rule.startDate) {
      candidate = addWeeks(candidate, 1);
    }
  }

  if (rule.frequency === "monthly") {
    const targetDom =
      typeof rule.dayOfMonth === "number"
        ? rule.dayOfMonth
        : getDate(rule.startDate);
    const lastDay = getDate(lastDayOfMonth(candidate));
    const clamped = Math.min(targetDom, lastDay);
    candidate = set(candidate, { date: clamped });
    candidate = withTime(candidate, rule.timeOfDay);
    if (candidate <= now || candidate < rule.startDate) {
      const nextMonth = addMonths(candidate, 1);
      const nextLastDay = getDate(lastDayOfMonth(nextMonth));
      const nextClamped = Math.min(targetDom, nextLastDay);
      candidate = withTime(
        set(nextMonth, { date: nextClamped }),
        rule.timeOfDay,
      );
    }
  }

  if (rule.endDate && candidate > rule.endDate) return null;
  return candidate;
}
