# VS Code TimeNotify

TimeNotify for VS Code provides:
- a live status bar clock
- configurable reminders by date/time rules
- optional advance reminders
- optional modal reminders
- snooze support
- duplicate suppression window

## Configuration

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

`notificationMode` supports `toast` and `modal`.

`snoozeMinutes` controls how long the `Snooze` action delays a reminder:
- global `timenotify.snoozeMinutes` applies by default
- each event can override it
- `0` disables `Snooze` for that event

## Date rules
- `YYYY/MM/DD` exact date
- `MM/DD` yearly recurring
- `DD` monthly recurring
- `Mon` single weekday
- `Mon-Fri` weekday range
- `Mon,Wed,Fri` weekday list
- `Mon-Fri,Sun` mixed weekday range and list
- `workdays` alias for `Mon-Fri`
- `weekends` alias for `Sat,Sun`

## Time rules
- `HH:mm:ss`

## Clock format tokens
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

## Development

```bash
npm install
npm run compile
npm run test
```
