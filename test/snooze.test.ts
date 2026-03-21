import test from "node:test";
import assert from "node:assert/strict";
import { compileEvent } from "../src/parser";
import { getSnoozeAction, getSnoozeActionLabel, isSnoozeAction } from "../src/snooze";

test("getSnoozeActionLabel formats minutes in compact action text", () => {
  assert.equal(getSnoozeActionLabel(1), "Snooze 1m");
  assert.equal(getSnoozeActionLabel(10), "Snooze 10m");
});

test("getSnoozeAction omits action when snooze is disabled", () => {
  const event = compileEvent({ title: "Break", date: "3/18", time: "10:00:00", snoozeMinutes: 0 }, 0);
  assert.equal(getSnoozeAction(event), undefined);
});

test("isSnoozeAction matches only the event-specific snooze action", () => {
  const event = compileEvent({ title: "Break", date: "3/18", time: "10:00:00", snoozeMinutes: 5 }, 0);

  assert.equal(isSnoozeAction("Snooze 5m", event), true);
  assert.equal(isSnoozeAction("Snooze 10m", event), false);
  assert.equal(isSnoozeAction(undefined, event), false);
});
