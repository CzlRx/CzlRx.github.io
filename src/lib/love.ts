const dayMilliseconds = 24 * 60 * 60 * 1000;

function dateParts(dateValue: string | Date) {
  if (dateValue instanceof Date) {
    return {
      year: dateValue.getFullYear(),
      month: dateValue.getMonth() + 1,
      day: dateValue.getDate(),
    };
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  return { year, month, day };
}

export function getTogetherDays(startDate: string, currentDate = new Date()): number {
  const start = dateParts(startDate);
  const current = dateParts(currentDate);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const currentUtc = Date.UTC(current.year, current.month - 1, current.day);
  return Math.max(0, Math.floor((currentUtc - startUtc) / dayMilliseconds) + 1);
}

export function getRelationshipParts(startDate: string, currentDate = new Date()) {
  const [year, month, day] = startDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const elapsed = Math.max(0, currentDate.getTime() - start.getTime());
  const totalSeconds = Math.floor(elapsed / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getNextAnniversary(startDate: string, currentDate = new Date()): string {
  const { month, day } = dateParts(startDate);
  let year = currentDate.getFullYear();
  const anniversary = new Date(year, month - 1, day);

  if (anniversary.getTime() < currentDate.getTime()) {
    year += 1;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDaysUntil(dateValue: string, currentDate = new Date()): number {
  const target = dateParts(dateValue);
  const current = dateParts(currentDate);
  const targetUtc = Date.UTC(target.year, target.month - 1, target.day);
  const currentUtc = Date.UTC(current.year, current.month - 1, current.day);
  return Math.max(0, Math.ceil((targetUtc - currentUtc) / dayMilliseconds));
}

export function formatDateLabel(dateValue: string): string {
  const { year, month, day } = dateParts(dateValue);
  return `${year} 年 ${month} 月 ${day} 日`;
}
