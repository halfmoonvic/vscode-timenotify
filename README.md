# VS Code TimeNotify

TimeNotify is a VS Code extension that combines a live status bar clock with configurable date/time-based reminders, including advance alerts, snooze, toast or modal delivery, duplicate suppression, and automatic config reload.

## Features

- Live status bar clock
- Custom clock format tokens
- Left or right status bar placement
- Rule-based reminders by exact date, yearly date, monthly day, weekday list, and weekday range
- Advance reminders with `advanceMinutes`
- Toast or modal reminder delivery
- Global defaults with per-event overrides
- Snooze actions with configurable delay
- Duplicate suppression using `dedupeSeconds`
- Automatic reload when `timenotify` settings change
- Output channel logging for config errors and trigger activity
- `timenotify.showNow` command

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
  "timenotify.pollIntervalSeconds": 1,
  "timenotify.statusBarAlignment": "right",
  "timenotify.dedupeSeconds": 300,
  "timenotify.notificationMode": "toast",
  "timenotify.snoozeMinutes": 10,
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
- `timenotify.pollIntervalSeconds`
  Controls how often the scheduler checks for due reminders.
- `timenotify.statusBarAlignment`
  Controls whether the clock appears on the `left` or `right` side of the status bar.
- `timenotify.dedupeSeconds`
  Suppresses repeated triggers for the same event within the configured window.
- `timenotify.notificationMode`
  Sets the global default reminder delivery mode: `toast` or `modal`.
- `timenotify.snoozeMinutes`
  Sets the global default snooze duration in minutes.
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

## Development

```bash
npm install
npm run compile
npm run test
```
