// Blocs partagés du site public (cartes de service, équipements, productions)
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Mic2, Disc3, SlidersHorizontal, Sparkles, Music2, Play, ExternalLink } from 'lucide-react';
import { SmartImage, LogoArt, logoVariantFor } from '../media';
import { cx, fcfa } from '../../lib/format';
import type { Equipment, Service } from '../../lib/types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'enregistrement-studio': Mic2,
  mixage: SlidersHorizontal,
  mastering: Disc3,
  'composition-musicale': Music2,
  'voix-off': Mic2,
  'conception-jingle': Sparkles
};
export const serviceIcon = (slug: string) => ICONS[slug] || Music2;

export const priceLabel = (s: Service) =>
  s.booking_mode === 'quote' || !s.price ? 'Sur devis' : `${fcfa(s.price)}${s.price_unit ? ` / ${s.price_unit}` : ''}`;

export const bookLink = (s: Service) => (s.booking_mode === 'quote' ? `/contact?service=${encodeURIComponent(s.name)}` : `/reservation?service=${s.slug}`);

export const ServiceCard: React.FC<{ service: Service; index?: number; className?: string }> = ({ service: s, index = 0, className }) => (
  <article className={cx('reveal group relative flex flex-col overflow-hidden rounded-3xl border border-ink-600/70 bg-ink-800/60 transition duration-500 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_30px_60px_-30px_rgba(242,107,33,.45)]', className)} style={{ transitionDelay: `${index * 70}ms` }}>
    <div className="relative aspect-[16/10] overflow-hidden">
      {s.image_url
        ? <SmartImage src={s.image_url} alt={s.name} className="absolute inset-0" imgClassName="group-hover:scale-105" />
        : <LogoArt variant={logoVariantFor(index)} />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/10 to-transparent" />
    </div>
    <div className="flex flex-1 flex-col p-7 pt-5">
      <h3 className="text-xl font-semibold">{s.name}</h3>
      {s.tagline && <p className="mt-2 text-sm leading-relaxed text-bone-400">{s.tagline}</p>}
      {s.features.length > 0 && (
        <ul className="mt-5 space-y-2">
          {s.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-bone-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{f}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-end justify-between gap-4 pt-7">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-bone-600">Tarif</p>
          <p className="font-display text-lg font-semibold">{priceLabel(s)}</p>
        </div>
        <Link to={bookLink(s)} className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-bone px-5 text-[13px] font-bold text-ink transition group-hover:bg-white">
          {s.booking_mode === 'quote' ? 'Demander' : 'Réserver'} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

export const EquipmentCard: React.FC<{ item: Equipment; index?: number; large?: boolean; onOpen?: () => void }> = ({ item, index = 0, large, onOpen }) => {
  const photo = item.photos[0];
  const Wrapper: React.ElementType = onOpen && photo ? 'button' : 'div';
  return (
    <article className={cx('reveal group relative overflow-hidden rounded-3xl border border-ink-600/70 bg-ink-800 transition duration-500 hover:border-ember/40', large ? 'sm:row-span-2' : '')} style={{ transitionDelay: `${index * 60}ms` }}>
      <Wrapper {...(Wrapper === 'button' ? { type: 'button', onClick: onOpen, 'aria-label': `Voir les photos : ${item.name}` } : {})}
        className={cx('relative block w-full overflow-hidden text-left', large ? 'aspect-[4/5] sm:h-full sm:min-h-[560px] sm:aspect-auto' : 'aspect-[4/5]')}>
        {photo
          ? <SmartImage src={photo.url} alt={item.name} className="absolute inset-0" imgClassName="duration-[1.2s] group-hover:scale-[1.06]" />
          : <LogoArt variant={logoVariantFor(index + 2)} />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {item.photos.length > 1 && <span className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{item.photos.length} photos</span>}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-6 transition duration-500 group-hover:translate-y-0">
          {item.category && <p className="eyebrow mb-2">{item.category}</p>}
          <h3 className="text-xl font-semibold">{item.name}</h3>
          {item.description && <p className="mt-2 line-clamp-2 max-w-md text-sm text-bone-200 opacity-80 transition group-hover:opacity-100">{item.description}</p>}
        </div>
      </Wrapper>
    </article>
  );
};

// Productions réalisées au studio (liens Apple Music du site existant)
export const TRACKS = [
  { title: 'Fatou Sangaré', artist: 'Westaf Studio Production', duration: '3:12', url: 'https://music.apple.com/fr/song/fatou-sangar%C3%A9/1785404198' },
  { title: 'Comme ni nga ma (feat. Astar)', artist: 'Westaf Studio', duration: '3:45', url: 'https://music.apple.com/fr/song/comme-ni-nga-ma-feat-astar/1774053167' },
  { title: 'Damalay bëgg', artist: 'Westaf Studio', duration: '3:20', url: 'https://music.apple.com/fr/song/damalay-b%C3%ABgg/1813891527' }
];
export const PLAYLIST_URL = 'https://music.apple.com/fr/playlist/mbalax/pl.u-oZyllYaIRWNp6r8';

export const TrackList: React.FC = () => (
  <ol className="divide-y divide-ink-600/70 border-y border-ink-600/70">
    {TRACKS.map((t, i) => (
      <li key={t.url} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
        <a href={t.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-5 sm:gap-6">
          <span className="w-6 font-display text-sm tabular-nums text-bone-600">0{i + 1}</span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink-500 transition group-hover:border-ember group-hover:bg-ember">
            <Play className="ml-0.5 h-4 w-4 text-bone group-hover:text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-lg font-semibold transition group-hover:text-ember sm:text-xl">{t.title}</span>
            <span className="block text-sm text-bone-400">{t.artist}</span>
          </span>
          <span className="hidden text-sm tabular-nums text-bone-600 sm:block">{t.duration}</span>
          <ExternalLink className="h-4 w-4 text-bone-600 transition group-hover:text-ember" />
        </a>
      </li>
    ))}
  </ol>
);

export const SectionTitle: React.FC<{ eyebrow: string; title: React.ReactNode; text?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ eyebrow, title, text, action, className }) => (
  <div className={cx('reveal mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between', className)}>
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-base leading-relaxed text-bone-400">{text}</p>}
    </div>
    {action}
  </div>
);
