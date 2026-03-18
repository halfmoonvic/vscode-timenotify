const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function to12Hour(hour: number): number {
  const normalized = hour % 12;
  return normalized === 0 ? 12 : normalized;
}

export function formatClock(date: Date, format: string): string {
  const tokenMap: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad2(date.getMonth() + 1),
    DD: pad2(date.getDate()),
    dddd: WEEKDAY_LONG[date.getDay()],
    ddd: WEEKDAY_SHORT[date.getDay()],
    HH: pad2(date.getHours()),
    hh: pad2(to12Hour(date.getHours())),
    mm: pad2(date.getMinutes()),
    ss: pad2(date.getSeconds()),
    A: date.getHours() < 12 ? "AM" : "PM",
    a: date.getHours() < 12 ? "am" : "pm"
  };

  return format.replace(/YYYY|MM|DD|dddd|ddd|HH|hh|mm|ss|A|a/g, (token) => tokenMap[token] ?? token);
}
