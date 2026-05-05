import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';
import {
  addDays,
  daysInMonth,
  fromISODate,
  inRange,
  isPast,
  startOfMonth,
  toISODate,
  type ISODate,
} from '@/lib/availability';

// Generic month-view calendar. Three modes:
//
//   - 'single'   — one tap selects/deselects a date.
//   - 'range'    — first tap = start, second = end (auto-orders).
//   - 'multi'    — toggle individual days (used to block out availability).
//
// `disabled` flips a day to unavailable. `disablePast` (default true) is
// the conventional "you can't book yesterday" guard.

export type CalendarMode = 'single' | 'range' | 'multi';

type Props = {
  mode: CalendarMode;
  // Single mode value.
  value?: ISODate;
  onChange?: (date: ISODate) => void;
  // Range mode value.
  range?: { start: ISODate; end: ISODate } | null;
  onRangeChange?: (range: { start: ISODate; end: ISODate } | null) => void;
  // Multi mode value.
  selected?: ISODate[];
  onToggle?: (date: ISODate) => void;
  // Days that can't be picked.
  disabled?: ISODate[];
  disablePast?: boolean;
  // Initial month to display.
  initialMonth?: Date;
};

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export function Calendar({
  mode,
  value,
  onChange,
  range,
  onRangeChange,
  selected,
  onToggle,
  disabled = [],
  disablePast = true,
  initialMonth,
}: Props) {
  const C = useColors();
  const [cursor, setCursor] = useState<Date>(initialMonth ?? new Date());
  // For range mode: when only the start is set, hover/preview is the same value.
  const [pendingStart, setPendingStart] = useState<ISODate | null>(null);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const grid = useMemo(() => buildGrid(cursor), [cursor]);
  const disabledSet = useMemo(() => new Set(disabled), [disabled]);
  const selectedSet = useMemo(() => new Set(selected ?? []), [selected]);

  const isDisabled = (d: ISODate) =>
    disabledSet.has(d) || (disablePast && isPast(d));

  const onPress = (d: ISODate) => {
    if (isDisabled(d)) return;
    if (mode === 'single') {
      onChange?.(d);
    } else if (mode === 'multi') {
      onToggle?.(d);
    } else {
      // range
      if (!pendingStart) {
        setPendingStart(d);
        onRangeChange?.({ start: d, end: d });
      } else {
        const start = pendingStart < d ? pendingStart : d;
        const end = pendingStart < d ? d : pendingStart;
        onRangeChange?.({ start, end });
        setPendingStart(null);
      }
    }
  };

  return (
    <View>
      {/* Month header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginBottom: 12,
        }}
      >
        <Pressable
          onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          hitSlop={6}
          style={{ padding: 6 }}
        >
          <Icon.Chevron size={18} dir="left" color={C.ink} />
        </Pressable>
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 16,
            color: C.ink,
          }}
        >
          {monthLabel}
        </Text>
        <Pressable
          onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          hitSlop={6}
          style={{ padding: 6 }}
        >
          <Icon.Chevron size={18} dir="right" color={C.ink} />
        </Pressable>
      </View>

      {/* Weekday header */}
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
            <Text style={[t('caption'), { color: C.n500 }]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell, ci) => {
            if (!cell) {
              return <View key={ci} style={{ flex: 1, aspectRatio: 1 }} />;
            }
            const iso = cell;
            const dis = isDisabled(iso);
            const isToday = iso === toISODate(new Date());
            const isSel =
              mode === 'single'
                ? value === iso
                : mode === 'multi'
                  ? selectedSet.has(iso)
                  : range
                    ? inRange(iso, range.start, range.end)
                    : false;
            const isStart = mode === 'range' && range?.start === iso;
            const isEnd = mode === 'range' && range?.end === iso;
            return (
              <Pressable
                key={ci}
                onPress={() => onPress(iso)}
                disabled={dis}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 2,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      mode === 'range' && isSel && !isStart && !isEnd
                        ? C.primarySoft
                        : isSel
                          ? C.ink
                          : isToday
                            ? C.n50
                            : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'InstrumentSans-Medium',
                      fontSize: 14,
                      color: dis
                        ? C.n300
                        : isSel && (mode !== 'range' || isStart || isEnd)
                          ? '#FFF'
                          : isSel && mode === 'range'
                            ? C.ink
                            : C.ink,
                      textDecorationLine: dis && disabledSet.has(iso) ? 'line-through' : 'none',
                    }}
                  >
                    {fromISODate(iso).getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Build a weeks-as-rows grid. Cells are ISO date strings or null for the
// leading/trailing blanks. Monday-first to match the EU convention used
// across the rest of the app.
function buildGrid(cursor: Date): (ISODate | null)[][] {
  const first = startOfMonth(cursor);
  const total = daysInMonth(cursor);
  // JS getDay: 0=Sun, 1=Mon... — shift to Mon-first.
  const lead = (first.getDay() + 6) % 7;
  const cells: (ISODate | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 0; d < total; d++) {
    cells.push(toISODate(addDays(first, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}
