import * as vscode from "vscode";
import {
  EventConfig,
  NotificationLevel,
  StatusBarAlignmentSetting,
  TimeNotifyConfig
} from "./types";

const DEFAULTS: TimeNotifyConfig = {
  enabled: true,
  clockFormat: "HH:mm:ss",
  pollIntervalSeconds: 1,
  statusBarAlignment: "right",
  dedupeSeconds: 300,
  notificationLevel: "info",
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
  const level = cfg.get<NotificationLevel>(
    "notificationLevel",
    DEFAULTS.notificationLevel
  );

  return {
    enabled: cfg.get<boolean>("enabled", DEFAULTS.enabled),
    clockFormat: cfg.get<string>("clockFormat", DEFAULTS.clockFormat),
    pollIntervalSeconds: Math.max(
      1,
      toPositiveInt(cfg.get<number>("pollIntervalSeconds"), DEFAULTS.pollIntervalSeconds)
    ),
    statusBarAlignment:
      alignment === "left" || alignment === "right"
        ? alignment
        : DEFAULTS.statusBarAlignment,
    dedupeSeconds: toPositiveInt(cfg.get<number>("dedupeSeconds"), DEFAULTS.dedupeSeconds),
    notificationLevel: level === "warning" ? "warning" : "info",
    events: readEvents(cfg.get<unknown>("events", DEFAULTS.events))
  };
}
