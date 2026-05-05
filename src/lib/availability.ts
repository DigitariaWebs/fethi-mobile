// Date utilities used by the calendar component and rental/service flows.

export type ISODate = string; // YYYY-MM-DD

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// Days between two ISO dates inclusive of start, exclusive of end. Used
// for rental day-count + total previews.
export function daysBetween(start: ISODate, end: ISODate): number {
  const s = fromISODate(start).getTime();
  const e = fromISODate(end).getTime();
  return Math.max(1, Math.round((e - s) / 86400000));
}

export function isPast(d: ISODate, today: Date = new Date()): boolean {
  return fromISODate(d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function inRange(d: ISODate, start: ISODate, end: ISODate): boolean {
  return d >= start && d <= end;
}

export function formatRange(start: ISODate, end: ISODate): string {
  const s = fromISODate(start);
  const e = fromISODate(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const f = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  if (sameMonth) return `${f(s)} – ${e.getDate()}`;
  return `${f(s)} – ${f(e)}`;
}
