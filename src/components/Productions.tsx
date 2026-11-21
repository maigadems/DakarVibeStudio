// Productions du studio (derniers sons) : cartes avec pochette, extrait audio et lien d'écoute.
import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Pause, Play } from 'lucide-react';
import { mediaUrl } from '../lib/api';
import { cx, fDateNum } from '../lib/format';
import { LogoArt, SmartImage, logoVariantFor } from './media';

export interface Production {
  id: number;
  title: string;
  artist: string | null;
  description: string | null;
  cover_url: string | null;
  audio_url: string | null;
  link_url: string | null;
  platform: string | null;
  release_date: string | null;
  is_featured: boolean;
  is_public?: boolean;
  sort_order?: number;
}

export const PLATFORM_LABEL: Record<string, string> = {
  apple_music: 'Apple Music', spotify: 'Spotify', youtube: 'YouTube', audiomack: 'Audiomack', boomplay: 'Boomplay', deezer: 'Deezer', soundcloud: 'SoundCloud', autre: 'Écouter'
};

// Un seul extrait joue à la fois sur la page
let currentAudio: HTMLAudioElement | null = null;

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

const AudioPreview: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => () => { if (currentAudio === audio.current) currentAudio = null; }, []);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      if (currentAudio && currentAudio !== a) currentAudio.pause();
      currentAudio = a;
      a.play().catch(() => setPlaying(false));
    } else a.pause();
  };

  return (
    <div className="flex items-center gap-3">
      <audio ref={audio} src={mediaUrl(src)} preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setTime(0); }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
      <button type="button" onClick={toggle} aria-label={playing ? `Mettre en pause ${title}` : `Écouter un extrait de ${title}`}
        className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition', playing ? 'bg-bone text-ink' : 'bg-gradient-to-r from-ember to-crimson text-white shadow-lg shadow-ember/30 hover:scale-105')}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-ink-600"
          onClick={(e) => {
            const a = audio.current;
            if (!a || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
          }}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ember to-crimson" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-bone-600"><span>{fmt(time)}</span><span>{duration ? fmt(duration) : 'Extrait'}</span></div>
      </div>
      <span className="flex h-5 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cx('w-[3px] origin-bottom rounded-full bg-ember', playing ? 'animate-eq' : 'opacity-40')} style={{ height: playing ? '100%' : `${30 + i * 15}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    </div>
  );
};

export const ProductionCard: React.FC<{ p: Production; index: number }> = ({ p, index }) => (
  <article className="reveal group flex flex-col overflow-hidden rounded-3xl border border-ink-600/70 bg-ink-800/60 transition duration-500 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_30px_60px_-30px_rgba(242,107,33,.45)]"
    style={{ transitionDelay: `${(index % 6) * 70}ms` }}>
    <div className="relative aspect-square overflow-hidden">
      {p.cover_url
        ? <SmartImage src={p.cover_url} alt={`Pochette de ${p.title}`} fit="cover" className="absolute inset-0" imgClassName="duration-[1.2s] group-hover:scale-105" />
        : <LogoArt variant={logoVariantFor(index + 1)} />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
      {p.release_date && <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold backdrop-blur">Sortie le {fDateNum(p.release_date)}</span>}
    </div>
    <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
      <div>
        <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
        {p.artist && <p className="text-sm text-bone-400">{p.artist}</p>}
        {p.description && <p className="mt-2 line-clamp-2 text-sm text-bone-400">{p.description}</p>}
      </div>
      <div className="mt-auto space-y-3">
        {p.audio_url && <AudioPreview src={p.audio_url} title={p.title} />}
        {p.link_url && (
          <a href={p.link_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-bone transition hover:text-ember">
            {p.platform && p.platform !== 'autre' ? `Écouter sur ${PLATFORM_LABEL[p.platform] || p.platform}` : 'Écouter le titre'} <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  </article>
);
