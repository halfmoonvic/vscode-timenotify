import { DEFAULT_NOTIFICATION_MODE, DEFAULT_SNOOZE_MINUTES } from "./defaults";
import { CompiledEvent, DateRule, EventConfig, NotificationMode, TimeRule } from "./types";

export interface EventDefaults {
  notificationMode: NotificationMode;
  snoozeMinutes: number;
}

const WEEKDAYS: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};

const WEEKDAY_ALIASES: Record<string, number[]> = {
  everyday: [0, 1, 2, 3, 4, 5, 6],
  workdays: [1, 2, 3, 4, 5],
  weekends: [0, 6]
};
const LEAP_YEAR_REFERENCE = 2024;

function parseIntStrict(value: string, label: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`invalid ${label}: ${value}`);
  }
  return Number.parseInt(value, 10);
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((left, right) => left - right);
}

function parseWeekdayToken(input: string): number {
  const normalized = input.trim().toLowerCase();
  const weekday = WEEKDAYS[normalized];
  if (weekday === undefined) {
    throw new Error(`invalid weekday: ${input.trim()}`);
  }
  return weekday;
}

function expandWeekdayRange(segment: string): number[] {
  const parts = segment.split("-");
  if (parts.length !== 2) {
    throw new Error(`invalid weekday expression: ${segment}`);
  }

  const start = parseWeekdayToken(parts[0]);
  const end = parseWeekdayToken(parts[1]);
  const weekdays: number[] = [];
  let weekday = start;
  while (true) {
    weekdays.push(weekday);
    if (weekday === end) {
      break;
    }
    weekday = (weekday + 1) % 7;
  }
  return weekdays;
}

function parseWeekdayExpression(input: string): number[] {
  const normalized = input.trim();
  const alias = WEEKDAY_ALIASES[normalized.toLowerCase()];
  if (alias) {
    return alias;
  }

  const segments = normalized.split(",");
  if (segments.some((segment) => segment.trim() === "")) {
    throw new Error(`invalid weekday expression: ${normalized}`);
  }

  const weekdays = segments.flatMap((segment) => {
    const trimmed = segment.trim();
    if (trimmed.includes("-")) {
      return expandWeekdayRange(trimmed);
    }
    return [parseWeekdayToken(trimmed)];
  });

  return uniqueSorted(weekdays);
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const candidate = new Date(year, month - 1, day);
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
}

function assertValidCalendarDate(input: string, year: number, month: number, day: number): void {
  if (!isValidCalendarDate(year, month, day)) {
    throw new Error(`invalid calendar date: ${input}`);
  }
}

function parseDateRule(input: string): DateRule {
  const value = input.trim();
  if (!value) {
    throw new Error("date is required");
  }

  if (
    WEEKDAY_ALIASES[value.toLowerCase()] ||
    value.includes(",") ||
    /[A-Za-z]/.test(value)
  ) {
    return { kind: "weekdays", weekdays: parseWeekdayExpression(value) };
  }

  if (!value.includes("/")) {
    const day = parseIntStrict(value, "day");
    if (day < 1 || day > 31) {
      throw new Error(`day out of range: ${day}`);
    }
    return { kind: "monthly", day };
  }

  const parts = value.split("/").map((part) => part.trim());
  if (parts.length === 3) {
    const year = parseIntStrict(parts[0], "year");
    const month = parseIntStrict(parts[1], "month");
    const day = parseIntStrict(parts[2], "day");
    if (month < 1 || month > 12) {
      throw new Error(`month out of range: ${month}`);
    }
    if (day < 1 || day > 31) {
      throw new Error(`day out of range: ${day}`);
    }
    assertValidCalendarDate(value, year, month, day);
    return { kind: "exact", year, month, day };
  }

  if (parts.length === 2) {
    const month = parseIntStrict(parts[0], "month");
    const day = parseIntStrict(parts[1], "day");
    if (month < 1 || month > 12) {
      throw new Error(`month out of range: ${month}`);
    }
    if (day < 1 || day > 31) {
      throw new Error(`day out of range: ${day}`);
    }
    assertValidCalendarDate(value, LEAP_YEAR_REFERENCE, month, day);
    return { kind: "yearly", month, day };
  }

  throw new Error(`invalid date format: ${input}`);
}

function parseTimeRule(input: string): TimeRule {
  const value = input.trim();
  if (!value) {
    throw new Error("time is required");
  }

  const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("time must use HH:mm:ss format");
  }

  const hour = parseIntStrict(match[1], "hour");
  const minute = parseIntStrict(match[2], "minute");
  const second = parseIntStrict(match[3], "second");

  if (hour < 0 || hour > 23) {
    throw new Error(`hour out of range: ${hour}`);
  }
  if (minute < 0 || minute > 59) {
    throw new Error(`minute out of range: ${minute}`);
  }
  if (second < 0 || second > 59) {
    throw new Error(`second out of range: ${second}`);
  }

  return { hour, minute, second };
}

export function compileEvent(event: EventConfig, index: number): CompiledEvent {
  const title = event.title.trim();
  if (!title) {
    throw new Error("event title is required");
  }

  const advanceMinutesRaw = event.advanceMinutes ?? 0;
  if (!Number.isFinite(advanceMinutesRaw) || advanceMinutesRaw < 0) {
    throw new Error(`advanceMinutes must be >= 0: ${advanceMinutesRaw}`);
  }

  const notificationMode =
    event.notificationMode === "modal" ? "modal" : event.notificationMode === "toast" ? "toast" : "toast";
  const snoozeMinutesRaw = event.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES;
  if (!Number.isFinite(snoozeMinutesRaw) || snoozeMinutesRaw < 0) {
    throw new Error(`snoozeMinutes must be >= 0: ${snoozeMinutesRaw}`);
  }

  return {
    id: `${index}:${title}`,
    title,
    message: event.message,
    dateRule: parseDateRule(event.date),
    timeRule: parseTimeRule(event.time),
    advanceMinutes: Math.floor(advanceMinutesRaw),
    notificationMode,
    snoozeMinutes: Math.floor(snoozeMinutesRaw)
  };
}

export function compileEvents(
  events: EventConfig[],
  defaults: EventDefaults = {
    notificationMode: DEFAULT_NOTIFICATION_MODE,
    snoozeMinutes: DEFAULT_SNOOZE_MINUTES
  }
): { compiled: CompiledEvent[]; errors: string[] } {
  const compiled: CompiledEvent[] = [];
  const errors: string[] = [];

  events.forEach((event, index) => {
    try {
      compiled.push(
        compileEvent(
          {
            ...event,
            notificationMode: event.notificationMode ?? defaults.notificationMode,
            snoozeMinutes: event.snoozeMinutes ?? defaults.snoozeMinutes
          },
          index
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`events[${index}] (${event.title ?? "untitled"}): ${message}`);
    }
  });

  return { compiled, errors };
}

export function isDateMatch(rule: DateRule, value: Date): boolean {
  const year = value.getFullYear();
  const month = value.getMonth() + 1;
  const day = value.getDate();
  const weekday = value.getDay();

  switch (rule.kind) {
    case "exact":
      return rule.year === year && rule.month === month && rule.day === day;
    case "yearly":
      return rule.month === month && rule.day === day;
    case "monthly":
      return rule.day === day;
    case "weekdays":
      return rule.weekdays.includes(weekday);
  }
}
