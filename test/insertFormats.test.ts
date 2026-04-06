import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_INSERT_FORMATS } from "../src/defaults";
import {
  createInsertFormatPickItems,
  formatInsertValue,
  getInsertFormatDescription,
  getInsertFormatLabel,
  normalizeInsertFormats,
  shouldPromptForInsertFormat
} from "../src/insertFormats";

test("normalizeInsertFormats keeps valid configured formats in order", () => {
  assert.deepEqual(
    normalizeInsertFormats(["dateTime", "timestampMs", "invalid"], DEFAULT_INSERT_FORMATS),
    ["dateTime", "timestampMs"]
  );
});

test("normalizeInsertFormats falls back when config is empty or invalid", () => {
  assert.deepEqual(normalizeInsertFormats([], DEFAULT_INSERT_FORMATS), DEFAULT_INSERT_FORMATS);
  assert.deepEqual(
    normalizeInsertFormats(["invalid", "still-invalid"], DEFAULT_INSERT_FORMATS),
    DEFAULT_INSERT_FORMATS
  );
});

test("formatInsertValue formats timestamp, ISO, and local date strings", () => {
  const utcDate = new Date("2026-04-06T08:14:55.123Z");
  const localDate = new Date(2026, 3, 6, 16, 14, 55, 123);

  assert.equal(formatInsertValue(utcDate, "timestampMs"), "1775463295123");
  assert.equal(formatInsertValue(utcDate, "timestampSec"), "1775463295");
  assert.equal(formatInsertValue(utcDate, "iso"), "2026-04-06T08:14:55.123Z");
  assert.equal(formatInsertValue(utcDate, "isoDate"), "2026-04-06");
  assert.equal(formatInsertValue(localDate, "dateTimeMs"), "2026-04-06 16:14:55.123");
  assert.equal(formatInsertValue(localDate, "dateTime"), "2026-04-06 16:14:55");
  assert.equal(formatInsertValue(localDate, "time"), "16:14:55");
  assert.equal(formatInsertValue(localDate, "compactDateTime"), "20260406161455");
  assert.equal(formatInsertValue(localDate, "compactDate"), "20260406");
  assert.equal(formatInsertValue(localDate, "date"), "2026-04-06");
});

test("insert format labels and descriptions are human-readable", () => {
  const date = new Date(2026, 3, 6, 16, 14, 55, 123);

  assert.equal(getInsertFormatLabel("timestampMs"), "Unix Milliseconds");
  assert.equal(getInsertFormatDescription(date, "timestampSec"), "1775463295");
  assert.equal(getInsertFormatDescription(date, "iso"), "UTC");
  assert.equal(getInsertFormatDescription(date, "dateTime"), "2026-04-06 16:14:55 (local)");
});

test("shouldPromptForInsertFormat only prompts when there are multiple choices", () => {
  assert.equal(shouldPromptForInsertFormat(["timestampMs"]), false);
  assert.equal(shouldPromptForInsertFormat(["timestampMs", "iso"]), true);
});

test("createInsertFormatPickItems exposes label, key, and preview separately", () => {
  const date = new Date(2026, 3, 6, 16, 14, 55, 123);
  const [item] = createInsertFormatPickItems(date, ["dateTime"]);

  assert.equal(item.label, "Local Date Time");
  assert.equal(item.description, "dateTime");
  assert.equal(item.detail, "2026-04-06 16:14:55 (local)");
  assert.equal(item.format, "dateTime");
});
