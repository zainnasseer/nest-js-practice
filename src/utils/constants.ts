import { formatInTimeZone } from "date-fns-tz";

function resolveAppTimeZone(): string {
  if (process.env.APP_TIME_ZONE) return process.env.APP_TIME_ZONE;

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function transformToLocalTime({ value }: { value: Date }): string {
  return formatInTimeZone(
    value, // date to format
    resolveAppTimeZone(), // get time zone from env or system
    "yyyy-MM-dd HH:mm:ss zzz"
  );
}

export const CURRENT_USER_KEY = "user";
