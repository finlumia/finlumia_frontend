"use client";

import React, { useMemo, useState } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import {
    type DatePeriod,
    todayPeriod,
    monthToPeriod,
    toISO,
    daysInMonth,
    formatPeriodShort,
    formatDateShort,
    isValidISO,
} from "../../../shared/finance/period.utils";
import styles from "./PeriodPicker.module.css";

export type PeriodMode = "today" | "range" | "month";

export type PeriodPickerProps = {
    value: DatePeriod;
    onChange: (period: DatePeriod) => void;
    theme?: ThemeMode;
    error?: string;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function compareISO(a: string, b: string) {
    return a.localeCompare(b);
}

function MonthCalendar({
    year, month, period, onSelectDay, theme,
}: {
    year: number;
    month: number;
    period: DatePeriod;
    onSelectDay: (iso: string) => void;
    theme: ThemeMode;
}) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const primary = f.colors.brand.primary;

    const firstDow = new Date(year, month - 1, 1).getDay();
    const totalDays = daysInMonth(year, month);

    const cells: { day: number; iso: string; inMonth: boolean }[] = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDow - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const pm = month === 1 ? 12 : month - 1;
        const py = month === 1 ? year - 1 : year;
        cells.push({ day: d, iso: toISO(py, pm, d), inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
        cells.push({ day: d, iso: toISO(year, month, d), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
        const d = cells.length - firstDow - totalDays + 1;
        const nm = month === 12 ? 1 : month + 1;
        const ny = month === 12 ? year + 1 : year;
        cells.push({ day: d, iso: toISO(ny, nm, d), inMonth: false });
    }

    const inRange = (iso: string) => {
        if (!period.start || !period.end) return false;
        return compareISO(iso, period.start) >= 0 && compareISO(iso, period.end) <= 0;
    };

    return (
        <div
            className={styles.calendar}
            style={{
                ["--period-primary" as string]: primary,
                ["--period-range-bg" as string]: isDark ? `${primary}33` : `${primary}22`,
                ["--period-text" as string]: f.colors.text.primary,
                ["--period-muted" as string]: f.colors.text.muted,
            }}
        >
            <div className={styles.weekdays}>
                {WEEKDAYS.map((w) => <span key={w} className={styles.weekday}>{w}</span>)}
            </div>
            <div className={styles.days}>
                {cells.map(({ day, iso, inMonth }) => {
                    const isStart = period.start === iso;
                    const isEnd = period.end === iso;
                    const selected = isStart || isEnd;
                    const ranged = inRange(iso) && !selected;
                    const cls = [
                        styles.dayBtn,
                        !inMonth ? styles.dayBtnOther : "",
                        selected ? styles.dayBtnSelected : "",
                        ranged ? styles.dayBtnInRange : "",
                        isStart && period.end && period.start !== period.end ? styles.dayBtnRangeStart : "",
                        isEnd && period.start !== period.end ? styles.dayBtnRangeEnd : "",
                    ].filter(Boolean).join(" ");

                    return (
                        <button
                            key={iso}
                            type="button"
                            className={cls}
                            onClick={() => onSelectDay(iso)}
                            aria-label={iso}
                            aria-pressed={selected}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function PeriodPicker({ value, onChange, theme = "dark", error }: PeriodPickerProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [mode, setMode] = useState<PeriodMode>("range");
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);
    const [pickingEnd, setPickingEnd] = useState(false);
    const [monthYear, setMonthYear] = useState(() => new Date().getFullYear());
    const [monthStart, setMonthStart] = useState<number | null>(null);
    const [monthEnd, setMonthEnd] = useState<number | null>(null);

    const cssVars = {
        ["--period-border" as string]: f.colors.border.default,
        ["--period-surface" as string]: isDark ? f.colors.bg.elevated : "#fff",
        ["--period-sidebar" as string]: isDark ? f.colors.bg.surface : "#f8fafc",
        ["--period-primary" as string]: f.colors.brand.primary,
        ["--period-text" as string]: f.colors.text.primary,
        ["--period-muted" as string]: f.colors.text.muted,
        ["--period-hover" as string]: isDark ? `${f.colors.brand.primary}22` : `${f.colors.brand.primary}14`,
        ["--period-active-bg" as string]: isDark ? `${f.colors.brand.primary}28` : `${f.colors.brand.primary}18`,
        ["--period-error" as string]: f.colors.feedback.error,
    } as React.CSSProperties;

    const secondMonth = useMemo(() => {
        let m = viewMonth + 1;
        let y = viewYear;
        if (m > 12) { m = 1; y += 1; }
        return { year: y, month: m };
    }, [viewYear, viewMonth]);

    const handleMode = (m: PeriodMode) => {
        setMode(m);
        setPickingEnd(false);
        setMonthStart(null);
        setMonthEnd(null);
        if (m === "today") onChange(todayPeriod());
    };

    const handleDaySelect = (iso: string) => {
        if (mode !== "range") return;
        if (!pickingEnd || !value.start) {
            onChange({ start: iso, end: iso });
            setPickingEnd(true);
            return;
        }
        if (compareISO(iso, value.start) < 0) {
            onChange({ start: iso, end: value.start });
        } else {
            onChange({ start: value.start, end: iso });
        }
        setPickingEnd(false);
    };

    const handleMonthSelect = (monthIndex: number) => {
        const m = monthIndex + 1;
        if (monthStart === null) {
            setMonthStart(m);
            setMonthEnd(null);
            const p = monthToPeriod(`${monthYear}-${String(m).padStart(2, "0")}`);
            onChange(p);
            return;
        }
        const startM = Math.min(monthStart, m);
        const endM = Math.max(monthStart, m);
        const startP = monthToPeriod(`${monthYear}-${String(startM).padStart(2, "0")}`);
        const endP = monthToPeriod(`${monthYear}-${String(endM).padStart(2, "0")}`);
        onChange({ start: startP.start, end: endP.end });
        setMonthStart(startM);
        setMonthEnd(endM);
    };

    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };

    const fromLabel = value.start && isValidISO(value.start) ? formatDateShort(value.start) : "Não selecionado";
    const toLabel = value.end && isValidISO(value.end) ? formatDateShort(value.end) : "Não selecionado";

    return (
        <div className={styles.root} style={cssVars}>
            <div className={styles.shell}>
                <aside className={styles.sidebar}>
                    <span className={styles.sidebarLabel}>Modo de seleção</span>
                    {([
                        { id: "today" as const, label: "Hoje", icon: "📅" },
                        { id: "range" as const, label: "Diário", icon: "📆" },
                        { id: "month" as const, label: "Mensal", icon: "🗓" },
                    ]).map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={`${styles.modeBtn} ${mode === opt.id ? styles.modeBtnActive : ""}`}
                            onClick={() => handleMode(opt.id)}
                        >
                            <span aria-hidden="true">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                    {mode === "range" && (
                        <div className={styles.rangeSummary}>
                            <div className={styles.rangeRow}>
                                <span className={styles.rangeRowLabel}>DE</span>
                                <span className={styles.rangeRowValue}>{fromLabel}</span>
                            </div>
                            <div className={styles.rangeRow}>
                                <span className={styles.rangeRowLabel}>ATÉ</span>
                                <span className={styles.rangeRowValue}>{toLabel}</span>
                            </div>
                        </div>
                    )}
                </aside>

                {mode === "range" && (
                    <div className={styles.calendars}>
                        <div className={styles.calendar}>
                            <div className={styles.calHeader}>
                                <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Mês anterior">‹</button>
                                <span className={styles.calTitle}>{MONTH_NAMES[viewMonth - 1]} {viewYear}</span>
                                <span style={{ width: "3rem" }} />
                            </div>
                            <MonthCalendar
                                year={viewYear} month={viewMonth}
                                period={value}
                                onSelectDay={handleDaySelect} theme={theme}
                            />
                        </div>
                        <div className={styles.calendar}>
                            <div className={styles.calHeader}>
                                <span style={{ width: "3rem" }} />
                                <span className={styles.calTitle}>{MONTH_NAMES[secondMonth.month - 1]} {secondMonth.year}</span>
                                <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Próximo mês">›</button>
                            </div>
                            <MonthCalendar
                                year={secondMonth.year} month={secondMonth.month}
                                period={value}
                                onSelectDay={handleDaySelect} theme={theme}
                            />
                        </div>
                    </div>
                )}

                {mode === "month" && (
                    <>
                        <div className={styles.yearNav}>
                            <button type="button" className={styles.navBtn} onClick={() => setMonthYear((y) => y - 1)} aria-label="Ano anterior">‹</button>
                            <span className={styles.yearLabel}>{monthYear}</span>
                            <button type="button" className={styles.navBtn} onClick={() => setMonthYear((y) => y + 1)} aria-label="Próximo ano">›</button>
                        </div>
                        <div className={styles.monthGrid}>
                            {MONTH_NAMES.map((name, i) => {
                                const m = i + 1;
                                const inSel = monthStart !== null && monthEnd !== null && m >= monthStart && m <= monthEnd;
                                const isStart = monthStart === m;
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        className={`${styles.monthBtn} ${inSel || isStart ? styles.monthBtnActive : ""}`}
                                        onClick={() => handleMonthSelect(i)}
                                    >
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {mode === "today" && (
                    <div style={{ padding: "2.4rem", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: f.colors.text.muted, fontSize: "1.4rem" }}>
                        Período definido para hoje: <strong style={{ color: f.colors.text.primary, marginLeft: "0.4rem" }}>{formatPeriodShort(value)}</strong>
                    </div>
                )}
            </div>
            {error && <span className={styles.error}>⚠ {error}</span>}
        </div>
    );
}
