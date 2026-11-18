// Visionneuse plein écran : photo toujours entière, fond flouté de la photo, transitions
// directionnelles, préchargement des voisines, miniatures, clavier et glissement tactile.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl } from '../lib/api';
import { cx } from '../lib/format';

export interface LightboxItem { url: string; title?: string | null; description?: string | null }

export const Lightbox: React.FC<{ items: LightboxItem[]; index: number | null; onChange: (i: number | null) => void }> = ({ items, index, onChange }) => {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [dir, setDir] = useState<'left' | 'right' | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [drag, setDrag] = useState(0);
  const thumbs = useRef<HTMLDivElement>(null);
  const n = items.length;

  const go = useCallback((delta: number) => {
    if (index === null || n < 2) return;
    setDir(delta > 0 ? 'left' : 'right');
    onChange((index + delta + n) % n);
  }, [index, n, onChange]);
  const close = useCallback(() => onChange(null), [onChange]);

  useEffect(() => { setLoaded(false); }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Préchargement des photos voisines
    [index - 1, index + 1].forEach((i) => { const it = items[(i + n) % n]; if (it) new Image().src = mediaUrl(it.url); });
    thumbs.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [index, items, n, go, close]);

  if (index === null || !items[index]) return null;
  const item = items[index];
  const src = mediaUrl(item.url);

  return (
    <div className="fixed inset-0 z-[95] flex animate-fade-in flex-col overflow-hidden bg-black" role="dialog" aria-modal="true" aria-label="Visionneuse de photos"
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchMove={(e) => { if (touch.current) setDrag(e.touches[0].clientX - touch.current.x); }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        setDrag(0);
        if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) return close(); // glisser vers le haut / bas : fermer
        if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
      }}>
      {/* Fond : la photo elle-même, très floutée */}
      <img key={`bg-${src}`} src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 animate-fade-in object-cover opacity-50 blur-3xl saturate-150" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Barre supérieure */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums text-bone-200 backdrop-blur">{index + 1} / {n}</span>
        <button onClick={close} className="rounded-full bg-white/10 p-2.5 text-bone backdrop-blur transition hover:rotate-90 hover:bg-white/20" aria-label="Fermer"><X className="h-5 w-5" /></button>
      </div>

      {/* Photo */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20" onClick={close}>
        {!loaded && (
          <span className="absolute flex h-8 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-[3px] origin-bottom animate-wave rounded-full bg-ember" style={{ height: '100%', animationDelay: `${i * 0.12}s` }} />)}
          </span>
        )}
        <img key={src} src={src} alt={item.title || 'Photo du studio'} onLoad={() => setLoaded(true)} onClick={(e) => e.stopPropagation()} draggable={false}
          style={{ transform: drag ? `translateX(${drag}px)` : undefined }}
          className={cx('max-h-full max-w-full select-none rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] ring-1 ring-white/10',
            'h-auto w-auto transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            loaded && (dir === 'left' ? 'animate-slide-left' : dir === 'right' ? 'animate-slide-right' : 'animate-zoom-in'))} />
        {n > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3.5 text-bone backdrop-blur-md transition hover:scale-110 hover:bg-white/20 sm:block" aria-label="Photo précédente"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3.5 text-bone backdrop-blur-md transition hover:scale-110 hover:bg-white/20 sm:block" aria-label="Photo suivante"><ChevronRight className="h-6 w-6" /></button>
          </>
        )}
      </div>

      {/* Légende + miniatures */}
      <div className="relative z-10 px-4 pb-5 pt-4 sm:px-6">
        {(item.title || item.description) && (
          <div key={`cap-${index}`} className="mx-auto mb-4 max-w-2xl animate-fade-up text-center">
            {item.title && <p className="font-display text-lg font-semibold">{item.title}</p>}
            {item.description && <p className="mt-1 text-sm text-bone-200/80">{item.description}</p>}
          </div>
        )}
        {n > 1 && (
          <div ref={thumbs} className="no-scrollbar mx-auto flex max-w-3xl justify-start gap-2 overflow-x-auto px-1 py-1 sm:justify-center">
            {items.map((it, i) => (
              <button key={`${it.url}-${i}`} data-i={i} onClick={() => { setDir(i > index ? 'left' : 'right'); onChange(i); }}
                className={cx('relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition duration-300', i === index ? 'scale-105 ring-2 ring-ember' : 'opacity-50 ring-1 ring-white/10 hover:opacity-90')}
                aria-label={`Photo ${i + 1}`} aria-current={i === index}>
                <img src={mediaUrl(it.url)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
