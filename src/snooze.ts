import { CompiledEvent } from "./types";

export function getSnoozeActionLabel(snoozeMinutes: number): string {
  return `Snooze ${snoozeMinutes}m`;
}

export function getSnoozeAction(event: CompiledEvent): string | undefined {
  if (event.snoozeMinutes <= 0) {
    return undefined;
  }
  return getSnoozeActionLabel(event.snoozeMinutes);
}

export function isSnoozeAction(action: string | undefined, event: CompiledEvent): boolean {
  return action !== undefined && action === getSnoozeAction(event);
}
