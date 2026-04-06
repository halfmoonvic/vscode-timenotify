import * as vscode from "vscode";
import {
  DEFAULT_INSERT_FORMATS,
  DEFAULT_NOTIFICATION_MODE,
  DEFAULT_SNOOZE_MINUTES
} from "./defaults";
import { normalizeInsertFormats } from "./insertFormats";
import {
  EventConfig,
  NotificationMode,
  StatusBarAlignmentSetting,
  TimeNotifyConfig
} from "./types";

const DEFAULTS: TimeNotifyConfig = {
  enabled: true,
  clockFormat: "ddd MM/DD HH:mm:ss",
  statusBarAlignment: "right",
  dedupeSeconds: 300,
  notificationMode: DEFAULT_NOTIFICATION_MODE,
  snoozeMinutes: DEFAULT_SNOOZE_MINUTES,
  insert: DEFAULT_INSERT_FORMATS,
  events: []
};

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function readEvents(value: unknown): EventConfig[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is EventConfig => {
    if (!entry || typeof entry !== "object") {
      return false;
    }
    const obj = entry as Record<string, unknown>;
    return (
      typeof obj.title === "string" &&
      typeof obj.date === "string" &&
      typeof obj.time === "string"
    );
  });
}

export function loadConfig(): TimeNotifyConfig {
  const cfg = vscode.workspace.getConfiguration("timenotify");
  const alignment = cfg.get<StatusBarAlignmentSetting>(
    "statusBarAlignment",
    DEFAULTS.statusBarAlignment
  );
  const mode = cfg.get<NotificationMode>(
    "notificationMode",
    DEFAULTS.notificationMode
  );

  return {
    enabled: cfg.get<boolean>("enabled", DEFAULTS.enabled),
    clockFormat: cfg.get<string>("clockFormat", DEFAULTS.clockFormat),
    statusBarAlignment:
      alignment === "left" || alignment === "right"
        ? alignment
        : DEFAULTS.statusBarAlignment,
    dedupeSeconds: toPositiveInt(cfg.get<number>("dedupeSeconds"), DEFAULTS.dedupeSeconds),
    notificationMode: mode === "modal" ? "modal" : "toast",
    snoozeMinutes: toPositiveInt(cfg.get<number>("snoozeMinutes"), DEFAULTS.snoozeMinutes),
    insert: normalizeInsertFormats(cfg.get<unknown>("insert", DEFAULTS.insert), DEFAULT_INSERT_FORMATS),
    events: readEvents(cfg.get<unknown>("events", DEFAULTS.events))
  };
}
