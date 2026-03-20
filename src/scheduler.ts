import { CompiledEvent } from "./types";
import { isDateMatch } from "./parser";

export interface SchedulerOptions {
  intervalSeconds: number;
  dedupeSeconds: number;
  events: CompiledEvent[];
  onTrigger: (event: CompiledEvent, now: Date) => void;
}

interface SnoozedTrigger {
  id: string;
  event: CompiledEvent;
  triggerAtSec: number;
}

function toSecondPrecision(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function shouldTriggerAt(event: CompiledEvent, now: Date): boolean {
  const candidate = new Date(now.getTime() + event.advanceMinutes * 60_000);
  if (!isDateMatch(event.dateRule, candidate)) {
    return false;
  }
  return (
    candidate.getHours() === event.timeRule.hour &&
    candidate.getMinutes() === event.timeRule.minute &&
    candidate.getSeconds() === event.timeRule.second
  );
}

export class Scheduler {
  private timer: NodeJS.Timeout | undefined;
  private readonly lastTriggeredAt = new Map<string, number>();
  private readonly snoozedTriggers: SnoozedTrigger[] = [];
  private nextSnoozeId = 0;

  constructor(private options: SchedulerOptions) {}

  updateOptions(options: SchedulerOptions): void {
    this.options = options;
    this.lastTriggeredAt.clear();
    this.snoozedTriggers.length = 0;
  }

  start(): void {
    this.stop();
    this.timer = setInterval(() => this.tick(), this.options.intervalSeconds * 1000);
    this.tick();
  }

  stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  tick(now = new Date()): void {
    const nowSec = toSecondPrecision(now);
    this.triggerSnoozed(now, nowSec);
    for (const event of this.options.events) {
      if (!shouldTriggerAt(event, now) || this.shouldSkipTrigger(event.id, nowSec)) {
        continue;
      }
      this.markTriggered(event.id, nowSec);
      this.options.onTrigger(event, now);
    }
  }

  scheduleSnooze(event: CompiledEvent, minutes: number, now = new Date()): void {
    if (minutes <= 0) {
      return;
    }
    this.nextSnoozeId += 1;
    this.snoozedTriggers.push({
      id: `${event.id}@snooze:${this.nextSnoozeId}`,
      event,
      triggerAtSec: toSecondPrecision(new Date(now.getTime() + minutes * 60_000))
    });
  }

  private triggerSnoozed(now: Date, nowSec: number): void {
    const ready = this.snoozedTriggers.filter((trigger) => trigger.triggerAtSec <= nowSec);
    if (ready.length === 0) {
      return;
    }

    this.snoozedTriggers.splice(
      0,
      this.snoozedTriggers.length,
      ...this.snoozedTriggers.filter((trigger) => trigger.triggerAtSec > nowSec)
    );

    for (const trigger of ready) {
      if (this.shouldSkipTrigger(trigger.id, nowSec)) {
        continue;
      }
      this.markTriggered(trigger.id, nowSec);
      this.options.onTrigger(trigger.event, now);
    }
  }

  private shouldSkipTrigger(id: string, nowSec: number): boolean {
    const last = this.lastTriggeredAt.get(id);
    return (
      last !== undefined &&
      this.options.dedupeSeconds > 0 &&
      nowSec - last < this.options.dedupeSeconds
    );
  }

  private markTriggered(id: string, nowSec: number): void {
    this.lastTriggeredAt.set(id, nowSec);
  }
}
