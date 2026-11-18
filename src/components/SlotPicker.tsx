import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react';
import type { DaySummary, Slot } from '../lib/types';
import { cx, parseSql } from '../lib/format';
import { Skeleton } from './ui';

interface Props {
  loadDays: () => Promise<DaySummary[]>;
  loadSlots: (date: string) => Promise<Slot[]>;
  value: string | null; // début du créneau "YYYY-MM-DD HH:MM:SS"
  onChange: (start: string | null, slot?: Slot) => void;
  reloadKey?: string | number;
  currentStart?: string | null; // créneau actuel (report)
}

export const SlotPicker: React.FC<Props> = ({ loadDays, loadSlots, value, onChange, reloadKey, currentStart }) => {
  const [days, setDays] = useState<DaySummary[] | null>(null);
  const [date, setDate] = useState<string | null>(value ? value.slice(0, 10) : null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let off = false;
    setDays(null);
    setError(null);
    loadDays()
      .then((d) => {
        if (off) return;
        setDays(d);
        setDate((cur) => (cur && d.some((x) => x.date === cur && x.available > 0) ? cur : d.find((x) => x.available > 0)?.date || null));
      })
      .catch((e) => !off && setError(e.message));
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  useEffect(() => {
    if (!date) return setSlots(null);
    let off = false;
    setSlots(null);
    loadSlots(date).then((s) => !off && setSlots(s)).catch((e) => !off && setError(e.message));
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, reloadKey]);

  const scroll = (dir: number) => strip.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

  if (error) return <p className="text-sm text-[#F07A7A]">{error}</p>;
  if (!days) return <div className="flex gap-2">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-16 shrink-0" />)}</div>;
  if (!days.some((d) => d.available > 0)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-600 px-6 py-10 text-center text-sm text-bone-400">
        <CalendarX2 className="h-7 w-7 text-bone-600" />
        Aucun créneau disponible sur la période pour cette durée. Essayez une durée plus courte ou contactez le studio.
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div ref={strip} className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d) => {
            const dt = parseSql(d.date)!;
            const disabled = !d.open || d.available === 0;
            const active = d.date === date;
            return (
              <button key={d.date} type="button" disabled={disabled} onClick={() => { setDate(d.date); onChange(null); }}
                className={cx('flex w-[66px] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition',
                  active ? 'border-ember bg-ember text-white shadow-lg shadow-ember/30' : disabled ? 'border-ink-700 text-bone-600/60' : 'border-ink-600 bg-ink-900 hover:border-ember/60')}>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{dt.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')}</span>
                <span className="mt-1 font-display text-xl font-semibold">{dt.getUTCDate()}</span>
                <span className="text-[10px] uppercase">{dt.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 hidden justify-end gap-1 sm:flex">
          <button type="button" onClick={() => scroll(-1)} className="rounded-full p-1.5 text-bone-400 hover:bg-ink-700" aria-label="Jours précédents"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => scroll(1)} className="rounded-full p-1.5 text-bone-400 hover:bg-ink-700" aria-label="Jours suivants"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-4">
        {!slots ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-bone-400">Aucun créneau ce jour-là.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {slots.map((s) => {
              const active = s.start === value;
              const isCurrent = s.start === currentStart;
              return (
                <button key={s.start} type="button" disabled={!s.available || isCurrent} onClick={() => onChange(s.start, s)}
                  title={!s.available ? (s.reason === 'indisponible' ? 'Aucun ingénieur disponible' : 'Déjà réservé') : undefined}
                  className={cx('h-12 rounded-xl border text-sm font-semibold tabular-nums transition',
                    active ? 'border-ember bg-ember/15 text-bone ring-2 ring-ember/40'
                      : isCurrent ? 'border-amberish/40 bg-amberish/10 text-amberish'
                        : s.available ? 'border-ink-600 bg-ink-900 hover:border-ember/60' : 'cursor-not-allowed border-ink-700 bg-ink-800/40 text-bone-600 line-through decoration-bone-600/50')}>
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
