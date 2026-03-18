export type StatusBarAlignmentSetting = "left" | "right";
export type NotificationLevel = "info" | "warning";

export interface EventConfig {
  title: string;
  message?: string;
  date: string;
  time: string;
  advanceMinutes?: number;
}

export interface TimeNotifyConfig {
  enabled: boolean;
  clockFormat: string;
  pollIntervalSeconds: number;
  statusBarAlignment: StatusBarAlignmentSetting;
  dedupeSeconds: number;
  notificationLevel: NotificationLevel;
  events: EventConfig[];
}

export type DateRule =
  | { kind: "exact"; year: number; month: number; day: number }
  | { kind: "yearly"; month: number; day: number }
  | { kind: "monthly"; day: number }
  | { kind: "weekdays"; weekdays: number[] };

export interface TimeRule {
  hour: number;
  minute: number;
  second: number;
}

export interface CompiledEvent {
  id: string;
  title: string;
  message?: string;
  dateRule: DateRule;
  timeRule: TimeRule;
  advanceMinutes: number;
}
