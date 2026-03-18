import { CompiledEvent, DateRule, EventConfig, TimeRule } from "./types";

const WEEKDAYS: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};

function parseIntStrict(value: string, label: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`invalid ${label}: ${value}`);
  }
  return Number.parseInt(value, 10);
}

function parseDateRule(input: string): DateRule {
  const value = input.trim();
  if (!value) {
    throw new Error("date is required");
  }

  const weekday = WEEKDAYS[value.toLowerCase()];
  if (weekday !== undefined) {
    return { kind: "weekday", weekday };
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

  return {
    id: `${index}:${title}`,
    title,
    message: event.message,
    dateRule: parseDateRule(event.date),
    timeRule: parseTimeRule(event.time),
    advanceMinutes: Math.floor(advanceMinutesRaw)
  };
}

export function compileEvents(events: EventConfig[]): { compiled: CompiledEvent[]; errors: string[] } {
  const compiled: CompiledEvent[] = [];
  const errors: string[] = [];

  events.forEach((event, index) => {
    try {
      compiled.push(compileEvent(event, index));
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
    case "weekday":
      return rule.weekday === weekday;
  }
}
