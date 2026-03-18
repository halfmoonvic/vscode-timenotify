import test from "node:test";
import assert from "node:assert/strict";
import { formatClock } from "../src/clockFormat";

test("formatClock supports 24-hour format", () => {
  const date = new Date(2026, 2, 18, 23, 5, 7);
  assert.equal(formatClock(date, "YYYY-MM-DD HH:mm:ss"), "2026-03-18 23:05:07");
});

test("formatClock supports 12-hour format with uppercase meridiem", () => {
  const morning = new Date(2026, 2, 18, 0, 5, 7);
  const afternoon = new Date(2026, 2, 18, 15, 5, 7);

  assert.equal(formatClock(morning, "hh:mm:ss A"), "12:05:07 AM");
  assert.equal(formatClock(afternoon, "hh:mm:ss A"), "03:05:07 PM");
});

test("formatClock supports 12-hour format with lowercase meridiem", () => {
  const noon = new Date(2026, 2, 18, 12, 30, 45);
  assert.equal(formatClock(noon, "hh:mm:ss a"), "12:30:45 pm");
});
