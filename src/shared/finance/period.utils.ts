/** Date period as ISO strings (yyyy-MM-dd). */

export type DatePeriod = {
    start: string;
    end: string;
};

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISO(date: string): boolean {
    if (!ISO_RE.test(date)) return false;
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function todayISO(): string {
    const n = new Date();
    return toISO(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

export function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

export function toISO(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Full calendar month from "YYYY-MM". */
export function monthToPeriod(yearMonth: string): DatePeriod {
    const [y, m] = yearMonth.split("-").map(Number);
    const last = daysInMonth(y, m);
    return { start: toISO(y, m, 1), end: toISO(y, m, last) };
}

export function currentMonthPeriod(): DatePeriod {
    return monthToPeriod(new Date().toISOString().slice(0, 7));
}

export function todayPeriod(): DatePeriod {
    const t = todayISO();
    return { start: t, end: t };
}

export function periodsOverlap(a: DatePeriod, b: DatePeriod): boolean {
    return a.start <= b.end && a.end >= b.start;
}

export function formatDateShort(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

export function formatPeriodShort(p: DatePeriod): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split("-");
        return `${d}/${m}/${y}`;
    };
    if (p.start === p.end) return fmt(p.start);
    return `${fmt(p.start)} – ${fmt(p.end)}`;
}

/** Migrate legacy budget stored with `month: "YYYY-MM"`. */
export function legacyMonthToPeriod(month: string): DatePeriod {
    return monthToPeriod(month);
}
