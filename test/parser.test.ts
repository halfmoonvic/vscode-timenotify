import test from "node:test";
import assert from "node:assert/strict";
import { compileEvent, compileEvents, isDateMatch } from "../src/parser";

test("compileEvent parses yearly date with strict HH:mm:ss time", () => {
  const event = compileEvent(
    { title: "Anniversary", date: "12/25", time: "09:30:00", advanceMinutes: 15 },
    0
  );
  assert.equal(event.dateRule.kind, "yearly");
  assert.equal(event.timeRule.hour, 9);
  assert.equal(event.timeRule.minute, 30);
  assert.equal(event.timeRule.second, 0);
  assert.equal(event.advanceMinutes, 15);
});

test("compileEvent rejects non-HH:mm:ss time formats", () => {
  assert.throws(() => compileEvent({ title: "Weekly", date: "Mon", time: "8" }, 2), {
    message: "time must use HH:mm:ss format"
  });
  assert.throws(() => compileEvent({ title: "Weekly", date: "Mon", time: "9:30:00" }, 2), {
    message: "time must use HH:mm:ss format"
  });
  assert.throws(() => compileEvent({ title: "Weekly", date: "Mon", time: "09:30" }, 2), {
    message: "time must use HH:mm:ss format"
  });
});

test("compileEvents captures invalid entries", () => {
  const result = compileEvents([
    { title: "ok", date: "1", time: "10:00:00" },
    { title: "bad", date: "13/40", time: "99" }
  ]);
  assert.equal(result.compiled.length, 1);
  assert.equal(result.errors.length, 1);
});

test("compileEvent rejects out of range strict time parts", () => {
  assert.throws(() => compileEvent({ title: "BadHour", date: "1", time: "24:00:00" }, 0), {
    message: "hour out of range: 24"
  });
  assert.throws(() => compileEvent({ title: "BadMinute", date: "1", time: "23:60:00" }, 0), {
    message: "minute out of range: 60"
  });
  assert.throws(() => compileEvent({ title: "BadSecond", date: "1", time: "23:59:60" }, 0), {
    message: "second out of range: 60"
  });
});

test("isDateMatch works for exact and weekday", () => {
  const date = new Date(2026, 2, 18, 12, 0, 0);
  assert.equal(isDateMatch({ kind: "exact", year: 2026, month: 3, day: 18 }, date), true);
  assert.equal(isDateMatch({ kind: "weekday", weekday: date.getDay() }, date), true);
  assert.equal(isDateMatch({ kind: "monthly", day: 1 }, date), false);
});
