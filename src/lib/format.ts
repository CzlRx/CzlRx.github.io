import { siteConfig } from "@/config/site";

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: siteConfig.timezone,
    ...options,
  }).format(new Date(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: siteConfig.timezone,
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}
