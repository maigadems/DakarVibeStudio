import React, { useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { LogoArt, SmartImage, logoVariantFor } from '../../components/media';
import { useAsync, useDocumentTitle, useReveal } from '../../lib/hooks';
import type { Equipment } from '../../lib/types';
import { PageHero } from '../../components/site/Chrome';
import { EquipmentCard } from '../../components/site/Sections';
import { Lightbox } from '../../components/Lightbox';
import { ErrorState, Skeleton, Tabs } from '../../components/ui';

const EquipmentPage: React.FC = () => {
  useDocumentTitle('Équipements');
  const ref = useReveal<HTMLDivElement>();
  const [cat, setCat] = useState('all');
  const [viewer, setViewer] = useState<{ items: { url: string; title: string; description?: string | null }[]; index: number } | null>(null);
  const { data, loading, error, reload } = useAsync(() => api<{ equipment: Equipment[] }>('/public/equipment', { auth: false }), []);
  const items = useMemo(() => data?.equipment || [], [data]);
  const categories = useMemo(() => [...new Set(items.map((e) => e.category || 'Matériel'))], [items]);
  const featured = items.filter((e) => e.is_featured && e.photos.length);
  const shown = items.filter((e) => cat === 'all' || (e.category || 'Matériel') === cat);

  return (
    <div ref={ref}>
      <PageHero eyebrow="Équipements" title={<>Le matériel <span className="serif-accent text-gradient">du studio.</span></>}
        text="Microphones, préamplis, écoutes et instruments disponibles pendant vos sessions." />

      <section className="container-x pb-24">
        {loading && <div className="grid gap-5 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>}
        {error && <ErrorState message={error} onRetry={reload} />}

        {featured.length > 0 && (
          <div className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e, i) => (
              <EquipmentCard key={e.id} item={e} index={i} large={i === 0 && featured.length >= 3} onOpen={() => setViewer({ items: e.photos.map((p) => ({ url: p.url, title: e.name, description: e.description })), index: 0 })} />
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="reveal mb-8"><Tabs value={cat} onChange={setCat} tabs={[{ id: 'all', label: 'Tout' }, ...categories.map((c) => ({ id: c, label: c }))]} /></div>
            <div className="divide-y divide-ink-600/70 border-y border-ink-600/70">
              {shown.map((e) => (
                <div key={e.id} className="reveal grid gap-4 py-6 sm:grid-cols-12 sm:items-center">
                  <p className="text-xs uppercase tracking-wider text-bone-600 sm:col-span-3">{e.category || 'Matériel'}</p>
                  <div className="sm:col-span-6">
                    <h3 className="font-display text-xl font-semibold">{e.name}</h3>
                    {e.description && <p className="mt-1 text-sm text-bone-400">{e.description}</p>}
                  </div>
                  <div className="flex gap-2 sm:col-span-3 sm:justify-end">
                    {e.photos.length === 0 && <div className="relative h-14 w-14 overflow-hidden rounded-xl ring-1 ring-ink-600"><LogoArt variant={logoVariantFor(e.id)} compact /></div>}
                    {e.photos.slice(0, 3).map((p, i) => (
                      <button key={p.id} onClick={() => setViewer({ items: e.photos.map((x) => ({ url: x.url, title: e.name })), index: i })} className="relative h-14 w-14 overflow-hidden rounded-xl ring-1 ring-ink-600 transition hover:scale-105 hover:ring-ember" aria-label={`Photo de ${e.name}`}>
                        <SmartImage src={p.url} alt="" fit="cover" className="h-full w-full" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <Lightbox items={viewer?.items || []} index={viewer ? viewer.index : null} onChange={(i) => setViewer((v) => (i === null || !v ? null : { ...v, index: i }))} />
    </div>
  );
};

export default EquipmentPage;
