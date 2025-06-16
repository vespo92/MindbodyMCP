export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function getWeekFromDate(startDate: string): { start: string; end: string } {
  return {
    start: startDate,
    end: addDays(startDate, 7),
  };
}

export function parseDateTime(dateTimeStr: string): Date {
  return new Date(dateTimeStr);
}

export function formatTime(dateTimeStr: string): string {
  const date = parseDateTime(dateTimeStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getDayOfWeek(dateTimeStr: string): string {
  const date = parseDateTime(dateTimeStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getDateOnly(dateTimeStr: string): string {
  return dateTimeStr.split('T')[0];
}

export function getDurationInMinutes(start: string, end: string): number {
  const startDate = parseDateTime(start);
  const endDate = parseDateTime(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const dateObj = new Date(date);
  const startObj = new Date(start);
  const endObj = new Date(end);
  return dateObj >= startObj && dateObj <= endObj;
}
