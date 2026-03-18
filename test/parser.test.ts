import test from "node:test";
import assert from "node:assert/strict";
import { compileEvent, compileEvents, isDateMatch } from "../src/parser";

test("compileEvent parses yearly date and short time", () => {
  const event = compileEvent(
    { title: "Anniversary", date: "12/25", time: "9:30", advanceMinutes: 15 },
    0
  );
  assert.equal(event.dateRule.kind, "yearly");
  assert.equal(event.timeRule.hour, 9);
  assert.equal(event.timeRule.minute, 30);
  assert.equal(event.timeRule.second, 0);
  assert.equal(event.advanceMinutes, 15);
});

test("compileEvent parses weekday and hour only", () => {
  const event = compileEvent({ title: "Weekly", date: "Mon", time: "8" }, 2);
  assert.equal(event.dateRule.kind, "weekday");
  assert.equal(event.timeRule.hour, 8);
  assert.equal(event.timeRule.minute, 0);
  assert.equal(event.timeRule.second, 0);
});

test("compileEvents captures invalid entries", () => {
  const result = compileEvents([
    { title: "ok", date: "1", time: "10" },
    { title: "bad", date: "13/40", time: "99" }
  ]);
  assert.equal(result.compiled.length, 1);
  assert.equal(result.errors.length, 1);
});

test("isDateMatch works for exact and weekday", () => {
  const date = new Date(2026, 2, 18, 12, 0, 0);
  assert.equal(isDateMatch({ kind: "exact", year: 2026, month: 3, day: 18 }, date), true);
  assert.equal(isDateMatch({ kind: "weekday", weekday: date.getDay() }, date), true);
  assert.equal(isDateMatch({ kind: "monthly", day: 1 }, date), false);
});
