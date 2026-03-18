# VS Code TimeNotify

TimeNotify for VS Code provides:
- a live status bar clock
- configurable reminders by date/time rules
- optional advance reminders
- duplicate suppression window

## Configuration

```json
{
  "timenotify.enabled": true,
  "timenotify.clockFormat": "HH:mm:ss",
  "timenotify.pollIntervalSeconds": 1,
  "timenotify.statusBarAlignment": "right",
  "timenotify.dedupeSeconds": 300,
  "timenotify.notificationLevel": "info",
  "timenotify.events": [
    {
      "title": "Standup",
      "message": "Daily sync starts now",
      "date": "Mon",
      "time": "10:00:00",
      "advanceMinutes": 5
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
    }
  ]
}
```

## Date rules
- `YYYY/MM/DD` exact date
- `MM/DD` yearly recurring
- `DD` monthly recurring
- `Mon..Sun` weekday recurring

## Time rules
- `HH:mm:ss`

## Development

```bash
npm install
npm run compile
npm run test
```
