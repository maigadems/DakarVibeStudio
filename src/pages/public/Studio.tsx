import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle, useReveal } from '../../lib/hooks';
import type { GalleryPhoto } from '../../lib/types';
import { PageHero } from '../../components/site/Chrome';
import { PhotoMasonry } from '../../components/PhotoMasonry';
import { LogoArt } from '../../components/media';
import { ErrorState, Skeleton } from '../../components/ui';

const Studio: React.FC = () => {
  useDocumentTitle('Le studio');
  const ref = useReveal<HTMLDivElement>();
  const { data, loading, error, reload } = useAsync(() => api<{ photos: GalleryPhoto[] }>('/public/gallery', { auth: false }), []);
  const photos = data?.photos || [];

  return (
    <div ref={ref}>
      <PageHero eyebrow="Le studio" title={<>Un lieu pensé pour <span className="serif-accent text-gradient">créer.</span></>}
        text="Cabine, régie, instruments : découvrez les espaces où naissent les productions du studio." />
      <section className="container-x pb-24">
        {loading && <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className={`mb-4 ${i % 2 ? 'h-72' : 'h-96'}`} />)}</div>}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && photos.length === 0 && (
          <div className="reveal relative h-[60vh] min-h-[380px] overflow-hidden rounded-[2rem] border border-ink-600/60">
            <LogoArt variant="pulse" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
              <p className="font-display text-xl font-semibold">Les photos du studio arrivent bientôt</p>
              <p className="mt-2 text-sm text-bone-400">En attendant, <Link to="/contact" className="text-ember hover:underline">passez nous voir</Link>.</p>
            </div>
          </div>
        )}
        {photos.length > 0 && <PhotoMasonry photos={photos} />}
      </section>
    </div>
  );
};

export default Studio;
