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

test("shouldTriggerAt still matches at scheduled time when advanceMinutes is set", () => {
  const event = compileEvent(
    { title: "Meeting", date: "3/18", time: "10:30:00", advanceMinutes: 10 },
    0
  );
  const now = new Date(2026, 2, 18, 10, 30, 0);
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
  scheduler.tick(new Date(2026, 2, 18, 10, 0, 0));

  assert.equal(hits.length, 1);
});

test("scheduler triggers advance reminder and on-time reminder separately", () => {
  const event = compileEvent(
    { title: "Meeting", date: "3/18", time: "10:30:00", advanceMinutes: 10 },
    0
  );
  const hits: string[] = [];
  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: [event],
    onTrigger: () => hits.push("x")
  });

  scheduler.tick(new Date(2026, 2, 18, 10, 20, 0));
  scheduler.tick(new Date(2026, 2, 18, 10, 30, 0));

  assert.equal(hits.length, 2);
});

test("scheduler dedupes repeated ticks per trigger kind without suppressing on-time reminder", () => {
  const event = compileEvent(
    { title: "Meeting", date: "3/18", time: "10:30:00", advanceMinutes: 10 },
    0
  );
  const hits: string[] = [];
  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: [event],
    onTrigger: () => hits.push("x")
  });

  const advance = new Date(2026, 2, 18, 10, 20, 0);
  const scheduled = new Date(2026, 2, 18, 10, 30, 0);

  scheduler.tick(advance);
  scheduler.tick(advance);
  scheduler.tick(scheduled);
  scheduler.tick(scheduled);

  assert.equal(hits.length, 2);
});

test("scheduler triggers workdays events on matching weekdays", () => {
  const event = compileEvent({ title: "Standup", date: "workdays", time: "09:00:00" }, 0);
  const hits: string[] = [];
  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: [event],
    onTrigger: () => hits.push("x")
  });

  scheduler.tick(new Date(2026, 2, 18, 9, 0, 0));
  assert.equal(hits.length, 1);
});

test("scheduler triggers snoozed reminders independently of recurring dedupe", () => {
  const event = compileEvent({ title: "Break", date: "3/18", time: "10:00:00" }, 0);
  const hits: string[] = [];
  const scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: 300,
    events: [event],
    onTrigger: () => hits.push("x")
  });

  const first = new Date(2026, 2, 18, 10, 0, 0);
  scheduler.tick(first);
  scheduler.scheduleSnooze(event, 10, first);
  scheduler.tick(new Date(2026, 2, 18, 10, 10, 0));

  assert.equal(hits.length, 2);
});
