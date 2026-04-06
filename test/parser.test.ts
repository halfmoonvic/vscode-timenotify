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
  assert.equal(event.notificationMode, "toast");
  assert.equal(event.snoozeMinutes, 5);
});

test("compileEvent parses a single weekday into unified weekdays model", () => {
  const event = compileEvent({ title: "Weekly", date: "Mon", time: "08:00:00" }, 2);
  assert.deepEqual(event.dateRule, { kind: "weekdays", weekdays: [1] });
});

test("compileEvent parses weekday ranges lists and aliases", () => {
  const rangeEvent = compileEvent({ title: "Range", date: "Mon-Fri", time: "08:00:00" }, 0);
  const fullWeekEvent = compileEvent(
    { title: "FullWeek", date: "Mon-Sun", time: "08:00:00" },
    1
  );
  const listEvent = compileEvent(
    { title: "List", date: "Mon,Wed,Fri", time: "08:00:00" },
    2
  );
  const wrappedRangeEvent = compileEvent(
    { title: "Wrapped", date: "Thu-Mon", time: "08:00:00" },
    3
  );
  const mixedEvent = compileEvent(
    { title: "Mixed", date: "Mon-Fri,Sun", time: "08:00:00" },
    4
  );
  const aliasEvent = compileEvent(
    { title: "Alias", date: "workdays", time: "08:00:00" },
    5
  );
  const weekendEvent = compileEvent(
    { title: "Weekend", date: "weekends", time: "08:00:00" },
    6
  );
  const everydayEvent = compileEvent(
    { title: "Everyday", date: "everyday", time: "08:00:00" },
    7
  );

  assert.deepEqual(rangeEvent.dateRule, { kind: "weekdays", weekdays: [1, 2, 3, 4, 5] });
  assert.deepEqual(fullWeekEvent.dateRule, { kind: "weekdays", weekdays: [0, 1, 2, 3, 4, 5, 6] });
  assert.deepEqual(listEvent.dateRule, { kind: "weekdays", weekdays: [1, 3, 5] });
  assert.deepEqual(wrappedRangeEvent.dateRule, { kind: "weekdays", weekdays: [0, 1, 4, 5, 6] });
  assert.deepEqual(mixedEvent.dateRule, { kind: "weekdays", weekdays: [0, 1, 2, 3, 4, 5] });
  assert.deepEqual(aliasEvent.dateRule, { kind: "weekdays", weekdays: [1, 2, 3, 4, 5] });
  assert.deepEqual(weekendEvent.dateRule, { kind: "weekdays", weekdays: [0, 6] });
  assert.deepEqual(everydayEvent.dateRule, { kind: "weekdays", weekdays: [0, 1, 2, 3, 4, 5, 6] });
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
    { title: "bad", date: "13/40", time: "99" },
    { title: "neg", date: "3/18", time: "10:00:00", snoozeMinutes: -1 }
  ]);
  assert.equal(result.compiled.length, 1);
  assert.equal(result.errors.length, 2);
});

test("compileEvent rejects invalid calendar dates", () => {
  assert.throws(() => compileEvent({ title: "Bad", date: "2026/02/31", time: "08:00:00" }, 0), {
    message: "invalid calendar date: 2026/02/31"
  });
  assert.throws(() => compileEvent({ title: "Bad", date: "4/31", time: "08:00:00" }, 0), {
    message: "invalid calendar date: 4/31"
  });
  assert.throws(() => compileEvent({ title: "Bad", date: "2/30", time: "08:00:00" }, 0), {
    message: "invalid calendar date: 2/30"
  });
});

test("compileEvent accepts valid calendar edge dates including leap day", () => {
  const exact = compileEvent({ title: "Exact", date: "2026/02/28", time: "08:00:00" }, 0);
  const yearly = compileEvent({ title: "LeapDay", date: "2/29", time: "08:00:00" }, 1);

  assert.equal(exact.dateRule.kind, "exact");
  assert.deepEqual(yearly.dateRule, { kind: "yearly", month: 2, day: 29 });
});

test("compileEvents applies global defaults and event overrides", () => {
  const result = compileEvents(
    [
      { title: "Defaulted", date: "3/18", time: "10:00:00" },
      {
        title: "Override",
        date: "3/18",
        time: "11:00:00",
        notificationMode: "modal",
        snoozeMinutes: 0
      }
    ],
    { notificationMode: "modal", snoozeMinutes: 15 }
  );

  assert.equal(result.errors.length, 0);
  assert.equal(result.compiled[0].notificationMode, "modal");
  assert.equal(result.compiled[0].snoozeMinutes, 15);
  assert.equal(result.compiled[1].notificationMode, "modal");
  assert.equal(result.compiled[1].snoozeMinutes, 0);
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

test("compileEvent rejects invalid weekday expressions", () => {
  assert.throws(() => compileEvent({ title: "Bad", date: "Mon,,Wed", time: "08:00:00" }, 0), {
    message: "invalid weekday expression: Mon,,Wed"
  });
  assert.throws(() => compileEvent({ title: "Bad", date: "Mon,1", time: "08:00:00" }, 0), {
    message: "invalid weekday: 1"
  });
  assert.throws(() => compileEvent({ title: "Bad", date: "Funday", time: "08:00:00" }, 0), {
    message: "invalid weekday: Funday"
  });
});

test("isDateMatch works for exact and unified weekdays", () => {
  const date = new Date(2026, 2, 18, 12, 0, 0);
  assert.equal(isDateMatch({ kind: "exact", year: 2026, month: 3, day: 18 }, date), true);
  assert.equal(isDateMatch({ kind: "weekdays", weekdays: [1, 2, 3, 4, 5] }, date), true);
  assert.equal(isDateMatch({ kind: "weekdays", weekdays: [0, 6] }, date), false);
  assert.equal(isDateMatch({ kind: "monthly", day: 1 }, date), false);
});
