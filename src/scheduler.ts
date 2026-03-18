import { CompiledEvent } from "./types";
import { isDateMatch } from "./parser";

export interface SchedulerOptions {
  intervalSeconds: number;
  dedupeSeconds: number;
  events: CompiledEvent[];
  onTrigger: (event: CompiledEvent, now: Date) => void;
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

  constructor(private options: SchedulerOptions) {}

  updateOptions(options: SchedulerOptions): void {
    this.options = options;
    this.lastTriggeredAt.clear();
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
    for (const event of this.options.events) {
      if (!shouldTriggerAt(event, now)) {
        continue;
      }
      const last = this.lastTriggeredAt.get(event.id);
      if (
        last !== undefined &&
        this.options.dedupeSeconds > 0 &&
        nowSec - last < this.options.dedupeSeconds
      ) {
        continue;
      }
      this.lastTriggeredAt.set(event.id, nowSec);
      this.options.onTrigger(event, now);
    }
  }
}
