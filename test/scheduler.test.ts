import test from "node:test";
import assert from "node:assert/strict";
import { compileEvent } from "../src/parser";
import { Scheduler, shouldTriggerAt } from "../src/scheduler";

test("shouldTriggerAt matches at exact time", () => {
  const event = compileEvent({ title: "Check", date: "3/18", time: "10:20:30" }, 0);
  const now = new Date(2026, 2, 18, 10, 20, 30);
  assert.equal(shouldTriggerAt(event, now), true);
});

test("shouldTriggerAt applies advanceMinutes", () => {
  const event = compileEvent(
    { title: "Meeting", date: "3/18", time: "10:30:00", advanceMinutes: 10 },
    0
  );
  const now = new Date(2026, 2, 18, 10, 20, 0);
  assert.equal(shouldTriggerAt(event, now), true);
});

test("scheduler dedupes within configured window", () => {
  const event = compileEvent({ title: "Ping", date: "3/18", time: "10:00:00" }, 0);
  const hits: string[] = [];
  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: [event],
    onTrigger: () => hits.push("x")
  });

  scheduler.tick(new Date(2026, 2, 18, 10, 0, 0));
  scheduler.tick(new Date(2026, 2, 18, 10, 0, 1));
  scheduler.tick(new Date(2026, 2, 18, 10, 5, 0));

  assert.equal(hits.length, 2);
});
