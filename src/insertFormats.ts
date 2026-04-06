import { InsertFormat } from "./types";

const INSERT_FORMAT_LABELS: Record<InsertFormat, string> = {
  timestampMs: "Unix Milliseconds",
  timestampSec: "Unix Seconds",
  iso: "ISO 8601 UTC",
  isoDate: "ISO Date",
  dateTimeMs: "Local Date Time With Milliseconds",
  dateTime: "Local Date Time",
  time: "Local Time",
  compactDateTime: "Compact Local Date Time",
  compactDate: "Compact Local Date",
  date: "Local Date"
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function pad3(value: number): string {
  return value.toString().padStart(3, "0");
}

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatLocalTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function formatLocalDateTime(date: Date): string {
  return `${formatLocalDate(date)} ${formatLocalTime(date)}`;
}

function formatCompactLocalDate(date: Date): string {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

export function isInsertFormat(value: unknown): value is InsertFormat {
  return typeof value === "string" && value in INSERT_FORMAT_LABELS;
}

export function normalizeInsertFormats(
  value: unknown,
  fallback: readonly InsertFormat[]
): InsertFormat[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const formats = value.filter(isInsertFormat);
  return formats.length > 0 ? formats : [...fallback];
}

export function shouldPromptForInsertFormat(formats: readonly InsertFormat[]): boolean {
  return formats.length > 1;
}

export function getInsertFormatLabel(format: InsertFormat): string {
  return INSERT_FORMAT_LABELS[format];
}

export function formatInsertValue(date: Date, format: InsertFormat): string {
  switch (format) {
    case "timestampMs":
      return date.getTime().toString();
    case "timestampSec":
      return Math.floor(date.getTime() / 1000).toString();
    case "iso":
      return date.toISOString();
    case "isoDate":
      return date.toISOString().slice(0, 10);
    case "dateTimeMs":
      return `${formatLocalDateTime(date)}.${pad3(date.getMilliseconds())}`;
    case "dateTime":
      return formatLocalDateTime(date);
    case "time":
      return formatLocalTime(date);
    case "compactDateTime":
      return `${formatCompactLocalDate(date)}${formatLocalTime(date).replace(/:/g, "")}`;
    case "compactDate":
      return formatCompactLocalDate(date);
    case "date":
      return formatLocalDate(date);
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function getInsertFormatDescription(date: Date, format: InsertFormat): string {
  if (format === "timestampMs" || format === "timestampSec") {
    return formatInsertValue(date, format);
  }

  if (format === "iso") {
    return "UTC";
  }

  if (format === "isoDate") {
    return `${date.toISOString().slice(0, 10)} (UTC date)`;
  }

  return `${formatInsertValue(date, format)} (local)`;
}

export function createInsertFormatPickItems(
  date: Date,
  formats: readonly InsertFormat[]
): Array<{ label: string; description: string; detail: string; format: InsertFormat }> {
  return formats.map((format) => ({
    label: getInsertFormatLabel(format),
    description: format,
    detail: getInsertFormatDescription(date, format),
    format
  }));
}
