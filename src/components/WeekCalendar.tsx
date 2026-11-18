// Vue calendrier hebdomadaire (administration et ingénieur)
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDaysStr, cx, fRange, parseSql, studioNow, studioToday } from '../lib/format';
import type { Reservation } from '../lib/types';

export interface CalBlock { id: string; start: string; end: string; title: string; subtitle?: string; tone: 'confirmed' | 'authorized' | 'pending' | 'done' | 'closure' | 'absence' | 'cancelled'; onClick?: () => void }

const TONES: Record<CalBlock['tone'], string> = {
  confirmed: 'border-ember/50 bg-ember/15 text-bone hover:bg-ember/25',
  authorized: 'border-sage/50 bg-sage/15 text-bone hover:bg-sage/25',
  pending: 'border-amberish/50 bg-amberish/10 text-bone hover:bg-amberish/20',
  done: 'border-ink-500 bg-ink-600/60 text-bone-400 hover:bg-ink-600',
  cancelled: 'border-ink-600 bg-ink-800 text-bone-600 line-through',
  closure: 'border-crimson/30 text-[#F07A7A] bg-[repeating-linear-gradient(45deg,rgba(217,58,58,.12)_0,rgba(217,58,58,.12)_6px,transparent_6px,transparent_12px)]',
  absence: 'border-sky-400/30 text-sky-300 bg-[repeating-linear-gradient(135deg,rgba(56,189,248,.10)_0,rgba(56,189,248,.10)_6px,transparent_6px,transparent_12px)]'
};

export const reservationTone = (r: Reservation): CalBlock['tone'] =>
  r.statut === 'annulee' ? 'cancelled'
    : r.statut === 'en_attente' || r.statut === 'a_traiter' ? 'pending'
      : r.statut === 'terminee' || (r.end_at && r.end_at < studioNow()) ? 'done'
        : ['autorisee', 'en_cours'].includes(r.session_status) ? 'authorized' : 'confirmed';

const HOUR_PX = 52;

export const WeekCalendar: React.FC<{ weekStart: string; onWeekChange: (d: string) => void; blocks: CalBlock[]; startHour?: number; endHour?: number; loading?: boolean }> = ({ weekStart, onWeekChange, blocks, startHour = 8, endHour = 24, loading }) => {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i)), [weekStart]);
  // Plage horaire étendue automatiquement si un bloc sort des heures par défaut
  const minH = Math.min(startHour, ...blocks.filter((b) => days.includes(b.start.slice(0, 10))).map((b) => Number(b.start.slice(11, 13))));
  const hours = Array.from({ length: endHour - minH }, (_, i) => minH + i);
  const today = studioToday();
  const now = studioNow();
  const end = addDaysStr(weekStart, 6);
  const fmt = (d: string, o: Intl.DateTimeFormatOptions) => parseSql(d)!.toLocaleDateString('fr-FR', { ...o, timeZone: 'UTC' });

  const place = (b: CalBlock, day: string) => {
    const dayStart = `${day} ${String(minH).padStart(2, '0')}:00:00`;
    const dayEnd = `${addDaysStr(day, 1)} 00:00:00`;
    const s = b.start < dayStart ? dayStart : b.start;
    const e = b.end > dayEnd ? dayEnd : b.end;
    if (s >= e) return null;
    const top = ((parseSql(s)!.getTime() - parseSql(dayStart)!.getTime()) / 3600000) * HOUR_PX;
    const h = ((parseSql(e)!.getTime() - parseSql(s)!.getTime()) / 3600000) * HOUR_PX;
    return { top, height: Math.max(h, 22) };
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-600/70 px-4 py-3">
        <p className="font-display font-semibold capitalize">{fmt(weekStart, { day: 'numeric', month: 'long' })} – {fmt(end, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onWeekChange(addDaysStr(weekStart, -7))} className="rounded-full p-2 hover:bg-ink-700" aria-label="Semaine précédente"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => onWeekChange(today)} className="rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-ink-700">Aujourd’hui</button>
          <button onClick={() => onWeekChange(addDaysStr(weekStart, 7))} className="rounded-full p-2 hover:bg-ink-700" aria-label="Semaine suivante"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className={cx('scrollbar-thin overflow-x-auto', loading && 'opacity-60')}>
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: '52px repeat(7, minmax(0, 1fr))' }}>
          <div className="border-b border-ink-600/70" />
          {days.map((d) => (
            <div key={d} className={cx('border-b border-l border-ink-600/70 px-2 py-2 text-center', d === today && 'bg-ember/10')}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-bone-600">{fmt(d, { weekday: 'short' })}</p>
              <p className={cx('font-display text-lg font-semibold', d === today && 'text-ember')}>{Number(d.slice(8, 10))}</p>
            </div>
          ))}
          <div className="relative">
            {hours.map((h) => <div key={h} className="relative text-right text-[10px] text-bone-600" style={{ height: HOUR_PX }}><span className="absolute -top-1.5 right-2">{String(h).padStart(2, '0')}h</span></div>)}
          </div>
          {days.map((d) => (
            <div key={d} className="relative border-l border-ink-600/70" style={{ height: hours.length * HOUR_PX }}>
              {hours.map((h) => <div key={h} className="border-t border-ink-700/70" style={{ height: HOUR_PX }} />)}
              {d === today && now.slice(11, 13) >= String(minH).padStart(2, '0') && (
                <div className="absolute inset-x-0 z-10 border-t-2 border-ember" style={{ top: ((Number(now.slice(11, 13)) - minH) + Number(now.slice(14, 16)) / 60) * HOUR_PX }} />
              )}
              {blocks.map((b) => {
                const p = place(b, d);
                if (!p) return null;
                const clickable = !!b.onClick;
                return (
                  <button key={`${b.id}-${d}`} type="button" onClick={b.onClick} disabled={!clickable}
                    className={cx('absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-[11px] leading-tight transition', TONES[b.tone], !clickable && 'cursor-default')}
                    style={{ top: p.top + 1, height: p.height - 2 }}>
                    <p className="truncate font-semibold">{b.title}</p>
                    {p.height > 34 && <p className="truncate opacity-80">{fRange(b.start, b.end)}{b.subtitle ? ` · ${b.subtitle}` : ''}</p>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-ink-600/70 px-4 py-3 text-[11px] text-bone-400">
        {[['confirmed', 'Confirmée'], ['authorized', 'Autorisée à commencer'], ['pending', 'En attente / à traiter'], ['done', 'Passée'], ['closure', 'Fermeture'], ['absence', 'Absence ingénieur']].map(([t, l]) => (
          <span key={t} className="flex items-center gap-1.5"><span className={cx('h-3 w-3 rounded border', TONES[t as CalBlock['tone']])} />{l}</span>
        ))}
      </div>
    </div>
  );
};
