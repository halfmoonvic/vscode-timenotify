import test from "node:test";
import assert from "node:assert/strict";
import { compileEvents } from "../src/parser";
import { Scheduler } from "../src/scheduler";

test("integration: compiled events are consumed by scheduler", () => {
  const { compiled, errors } = compileEvents([
    {
      title: "Standup",
      date: "3/18",
      time: "10:30:00",
      advanceMinutes: 10,
      message: "Meeting in 10 minutes",
      notificationMode: "modal",
      snoozeMinutes: 5
    }
  ], {
    notificationMode: "toast",
    snoozeMinutes: 10
  });

  assert.equal(errors.length, 0);
  assert.equal(compiled[0].notificationMode, "modal");
  assert.equal(compiled[0].snoozeMinutes, 5);
  const hits: string[] = [];

  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: compiled,
    onTrigger: (event) => hits.push(event.title)
  });

  scheduler.tick(new Date(2026, 2, 18, 10, 20, 0));
  scheduler.tick(new Date(2026, 2, 18, 10, 30, 0));

  assert.deepEqual(hits, ["Standup", "Standup"]);
});
