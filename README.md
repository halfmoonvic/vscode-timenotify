# VS Code TimeNotify

TimeNotify is a VS Code extension that combines a live status bar clock with configurable date/time-based reminders, including advance alerts, snooze, toast or modal delivery, duplicate suppression, and automatic config reload.

## Features

- Live status bar clock
- Custom clock format tokens
- Rule-based reminders by exact date, yearly date, monthly day, weekday list, and weekday range
- Advance reminders with `advanceMinutes`
- Toast or modal reminder delivery
- Global defaults with per-event overrides
- Snooze actions with configurable delay
- Duplicate suppression using `dedupeSeconds`
- Automatic reload when `timenotify` settings change
- Output channel logging for config errors and trigger activity
- `timenotify.showNow` command
- `timenotify.insertNow` command with configurable backend-friendly time formats

## Quick Start

Open your VS Code settings JSON and add a minimal configuration like this:

```json
{
  "timenotify.enabled": true,
  "timenotify.events": [
    {
      "title": "Standup",
      "date": "workdays",
      "time": "10:00:00"
    }
  ]
}
```

Once enabled, TimeNotify starts polling automatically and will show reminders when an event becomes due.

## Full Configuration Example

```json
{
  "timenotify.enabled": true,
  "timenotify.clockFormat": "HH:mm:ss",
  "timenotify.statusBarAlignment": "right",
  "timenotify.dedupeSeconds": 300,
  "timenotify.notificationMode": "toast",
  "timenotify.snoozeMinutes": 5,
  "timenotify.insert": ["timestampMs", "timestampSec", "iso", "dateTime"],
  "timenotify.events": [
    {
      "title": "Standup",
      "message": "Daily sync starts now",
      "date": "workdays",
      "time": "10:00:00",
      "advanceMinutes": 5,
      "notificationMode": "modal",
      "snoozeMinutes": 5
    },
    {
      "title": "Birthday",
      "date": "12/25",
      "time": "09:00:00"
    },
    {
      "title": "Pay rent",
      "date": "1",
      "time": "08:00:00"
    },
    {
      "title": "Gym",
      "date": "Mon,Wed,Fri",
      "time": "18:30:00"
    }
  ]
}
```

## Configuration Reference

### Top-level settings

- `timenotify.enabled`
  Enables or disables scheduled reminders.
- `timenotify.clockFormat`
  Controls the status bar clock display format.
- `timenotify.statusBarAlignment`
  Controls whether the clock appears on the `left` or `right` side of the status bar.
- `timenotify.dedupeSeconds`
  Suppresses repeated triggers for the same event within the configured window.
- `timenotify.notificationMode`
  Sets the global default reminder delivery mode: `toast` or `modal`.
- `timenotify.snoozeMinutes`
  Sets the global default snooze duration in minutes.
- `timenotify.insert`
  Controls which time formats are offered by the `TimeNotify: Insert Current Time` command. One valid item inserts directly; multiple valid items open a Quick Pick.
- `timenotify.events`
  Defines the list of reminder events.

### Event fields

Required:

- `title`
- `date`
- `time`

Optional:

- `message`
- `advanceMinutes`
- `notificationMode`
- `snoozeMinutes`

Behavior:

- Event-level `notificationMode` overrides the global `timenotify.notificationMode` default.
- Event-level `snoozeMinutes` overrides the global `timenotify.snoozeMinutes` default.
- `snoozeMinutes: 0` disables the snooze action for that event.
- `advanceMinutes` adds an early reminder before the scheduled event time, and the event still reminds again at the scheduled time.
- If `message` is omitted, the reminder shows only the event title.

## Date Rules

- `YYYY/MM/DD` exact date
- `MM/DD` yearly recurring
- `DD` monthly recurring
- `Mon` single weekday
- `Mon-Fri` weekday range
- `Mon-Sun` full week, equivalent to every day
- `Fri-Mon` wrapped weekday range across week boundaries
- `Mon,Wed,Fri` weekday list
- `Mon-Fri,Sun` mixed weekday range and list
- `everyday` alias for `Mon-Sun`
- `workdays` alias for `Mon-Fri`
- `weekends` alias for `Sat,Sun`

Weekday ranges are circular, so ranges that cross Sunday are valid.

## Time Rules

- `HH:mm:ss`

## Insert Formats

`timenotify.insert` accepts any combination of:

- `timestampMs` -> `1712390400123`
- `timestampSec` -> `1712390400`
- `iso` -> `2026-04-06T08:14:55.123Z`
- `isoDate` -> `2026-04-06`
- `dateTimeMs` -> `2026-04-06 16:14:55.123`
- `dateTime` -> `2026-04-06 16:14:55`
- `time` -> `16:14:55`
- `compactDateTime` -> `20260406161455`
- `compactDate` -> `20260406`
- `date` -> `2026-04-06`

Notes:

- Run `TimeNotify: Insert Current Time` to insert a configured current-time value into the active editor.
- There are 10 built-in insert format keys in total.
- `iso` always uses UTC.
- `isoDate` uses the UTC calendar date portion of ISO time.
- `dateTimeMs`, `dateTime`, `time`, `compactDateTime`, `compactDate`, and `date` use the local machine time zone.
- Invalid configured values are ignored.
- Duplicate configured values are currently kept, so repeated keys can produce repeated Quick Pick entries.
- In the Quick Pick, the main label is a friendly name, the short description shows the config key, and the detail line shows a live preview.
- If `timenotify.insert` resolves to one valid item, `insertNow` inserts it directly.
- If it resolves to multiple valid items, `insertNow` shows a Quick Pick to let you choose.

## Clock Format Tokens

- `YYYY` year
- `MM` month
- `DD` day
- `HH` 24-hour clock
- `hh` 12-hour clock
- `mm` minutes
- `ss` seconds
- `A` uppercase meridiem (`AM` / `PM`)
- `a` lowercase meridiem (`am` / `pm`)
- `ddd` weekday short name
- `dddd` weekday full name

## Reminder Behavior

- The scheduler checks reminders on a fixed polling interval.
- Advance reminders trigger before the configured event time, and events with `advanceMinutes` still trigger again at the configured time.
- Duplicate suppression prevents rapid repeated notifications for the same event.
- Snoozing schedules the same reminder again after the configured delay.
- Changes under the `timenotify` settings namespace are reloaded automatically.
- Invalid config entries are reported in the `TimeNotify` output channel.

## Commands

- `TimeNotify: Show Now`
  Shows the current local time immediately.
- `TimeNotify: Insert Current Time`
  Inserts the current time at the cursor, or replaces the current selection. Uses the configured `timenotify.insert` formats, inserts directly when there is one valid option, and shows a Quick Pick when there are multiple valid options.

## Development

```bash
npm install
npm run compile
npm run test
```
