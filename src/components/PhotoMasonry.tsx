// Galerie en mosaïque : chaque photo garde ses proportions réelles (aucun recadrage),
// apparition en fondu au chargement, survol animé, ouverture dans la visionneuse.
import React, { useState } from 'react';
import { Expand } from 'lucide-react';
import { mediaUrl } from '../lib/api';
import { cx } from '../lib/format';
import type { GalleryPhoto } from '../lib/types';
import { Lightbox } from './Lightbox';

const Tile: React.FC<{ photo: GalleryPhoto; index: number; onOpen: () => void }> = ({ photo: p, index, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const ratio = p.width && p.height ? `${p.width} / ${p.height}` : undefined;
  return (
    <button type="button" onClick={onOpen} aria-label={`Agrandir : ${p.title || 'photo du studio'}`}
      className="reveal group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl bg-ink-800 text-left ring-1 ring-ink-600/60 transition duration-500 hover:-translate-y-1 hover:ring-ember/40 hover:shadow-[0_30px_60px_-25px_rgba(242,107,33,.45)]"
      style={{ transitionDelay: `${(index % 6) * 70}ms` }}>
      <div className="relative" style={{ aspectRatio: ratio }}>
        {!loaded && <div className={cx('animate-shimmer bg-[linear-gradient(110deg,#141416_30%,#222226_50%,#141416_70%)] bg-[length:200%_100%]', ratio ? 'absolute inset-0' : 'aspect-[4/5]')} aria-hidden />}
        <img src={mediaUrl(p.url)} alt={p.title || 'Photo du studio'} loading="lazy" decoding="async" onLoad={() => setLoaded(true)}
          className={cx('block h-auto w-full transition-[opacity,transform,filter] duration-[1.1s] ease-out group-hover:scale-[1.05]',
            ratio && 'absolute inset-0 h-full object-cover', loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md')} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute right-4 top-4 flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur transition duration-300 group-hover:scale-100 group-hover:opacity-100"><Expand className="h-4 w-4" /></span>
      {(p.title || p.description) && (
        <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {p.title && <p className="font-display text-base font-semibold">{p.title}</p>}
          {p.description && <p className="mt-1 line-clamp-2 text-xs text-bone-200">{p.description}</p>}
        </div>
      )}
    </button>
  );
};

export const PhotoMasonry: React.FC<{ photos: GalleryPhoto[]; className?: string }> = ({ photos, className }) => {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <div className={cx('columns-1 gap-4', photos.length === 1 ? 'mx-auto max-w-xl' : photos.length === 2 ? 'sm:columns-2 lg:mx-auto lg:max-w-4xl' : 'sm:columns-2 lg:columns-3', className)}>
        {photos.map((p, i) => <Tile key={p.id} photo={p} index={i} onOpen={() => setIndex(i)} />)}
      </div>
      <Lightbox items={photos} index={index} onChange={setIndex} />
    </>
  );
};
