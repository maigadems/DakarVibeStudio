// Graphiques en barres à une seule série (couleur validée sur la surface sombre : #D9531A).
// Barres fines, extrémités arrondies ancrées sur la ligne de base, grille discrète,
// infobulle au survol / au focus et tableau accessible équivalent.
import React, { useState } from 'react';

const BAR = '#D9531A';

interface Datum { label: string; value: number; display: string; hint?: string }

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / p) * p;
};

export const BarChart: React.FC<{ data: Datum[]; title: string; height?: number; formatTick?: (v: number) => string }> = ({ data, title, height = 200, formatTick = (v) => String(v) }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [0, max / 2, max];
  return (
    <figure>
      <div className="relative flex gap-3" style={{ height }}>
        <div className="flex flex-col justify-between pb-6 text-right text-[10px] tabular-nums text-bone-600" aria-hidden>
          {[...ticks].reverse().map((t) => <span key={t}>{formatTick(t)}</span>)}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between" aria-hidden>
            {ticks.map((t) => <div key={t} className="border-t border-ink-600/50" />)}
          </div>
          <div className="absolute inset-x-0 bottom-6 top-0 flex items-end justify-around gap-[2px]">
            {data.map((d, i) => (
              <button key={d.label} type="button" className="group relative flex h-full flex-1 items-end justify-center focus:outline-none"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                aria-label={`${d.label} : ${d.display}`}>
                <span className="w-full max-w-[28px] rounded-t-[4px] transition-opacity" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0, background: BAR, opacity: hover === null || hover === i ? 1 : 0.45 }} />
                {hover === i && (
                  <span className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg border border-ink-600 bg-ink-900 px-2.5 py-1.5 text-left text-xs shadow-xl">
                    <span className="block text-bone-400">{d.label}</span>
                    <span className="block font-semibold text-bone">{d.display}</span>
                    {d.hint && <span className="block text-bone-600">{d.hint}</span>}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-around gap-[2px] text-[10px] text-bone-400" aria-hidden>
            {data.map((d, i) => <span key={d.label} className={`flex-1 text-center ${data.length > 12 ? "w-0 overflow-visible whitespace-nowrap" : "truncate"}${data.length > 12 && i !== 0 && (i + 1) % 5 !== 0 ? ' invisible sm:visible' : ''}`}>{d.label}</span>)}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{data.map((d) => <tr key={d.label}><th scope="row">{d.label}</th><td>{d.display}</td></tr>)}</tbody>
      </table>
    </figure>
  );
};

// Barres horizontales (répartition par service)
export const HBarList: React.FC<{ data: Datum[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-bone-200">{d.label}</span><span className="shrink-0 font-semibold tabular-nums">{d.display}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full rounded-r-[4px]" style={{ width: `${(d.value / max) * 100}%`, background: BAR }} />
          </div>
          {d.hint && <p className="mt-0.5 text-[11px] text-bone-600">{d.hint}</p>}
        </li>
      ))}
    </ul>
  );
};
