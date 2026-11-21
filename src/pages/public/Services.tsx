import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { LogoArt, SmartImage, logoVariantFor } from '../../components/media';
import { useAsync, useDocumentTitle, useReveal } from '../../lib/hooks';
import type { Service } from '../../lib/types';
import { PageHero } from '../../components/site/Chrome';
import { bookLink, priceLabel, serviceIcon } from '../../components/site/Sections';
import { ErrorState, Skeleton } from '../../components/ui';

const Services: React.FC = () => {
  useDocumentTitle('Nos services');
  const ref = useReveal<HTMLDivElement>();
  const { data, loading, error, reload } = useAsync(() => api<{ services: Service[] }>('/public/services', { auth: false }), []);
  const services = data?.services || [];
  const bookable = services.filter((s) => s.booking_mode !== 'quote');
  const quote = services.filter((s) => s.booking_mode === 'quote');

  return (
    <div ref={ref}>
      <PageHero eyebrow="Nos services" title={<>Tout ce qu’il faut pour <span className="serif-accent text-gradient">sortir votre son.</span></>}
        text="Enregistrement à l’heure, mixage et mastering au titre, et un accompagnement artistique sur demande. Les tarifs affichés sont ceux appliqués au studio." />

      <section className="container-x pb-24">
        {loading && <div className="space-y-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>}
        {error && <ErrorState message={error} onRetry={reload} />}

        <div className="space-y-6">
          {bookable.map((s, i) => {
            const Icon = serviceIcon(s.slug);
            const reverse = i % 2 === 1;
            return (
              <article key={s.id} id={s.slug} className="reveal group grid scroll-mt-28 overflow-hidden rounded-[2rem] border border-ink-600/70 bg-ink-800/60 lg:grid-cols-12">
                <div className={`relative min-h-[280px] overflow-hidden lg:col-span-5 ${reverse ? 'lg:order-2' : ''}`}>
                  {s.image_url
                    ? <SmartImage src={s.image_url} alt={s.name} className="absolute inset-0" imgClassName="duration-[1.2s] group-hover:scale-105" />
                    : <LogoArt variant={logoVariantFor(i)} label={s.name} />}
                  <span className="pointer-events-none absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-ember/30 bg-black/40 text-ember backdrop-blur"><Icon className="h-5 w-5" /></span>
                  <span className="pointer-events-none absolute bottom-4 right-6 font-display text-7xl font-bold text-bone/[.06]">0{i + 1}</span>
                </div>
                <div className="flex flex-col p-7 sm:p-10 lg:col-span-7">
                  <p className="eyebrow">0{i + 1} · {s.booking_mode === 'slot' ? 'À l’heure' : 'Au titre'}</p>
                  <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{s.name}</h2>
                  {s.tagline && <p className="mt-3 text-lg text-bone-200">{s.tagline}</p>}
                  {s.description && <p className="mt-4 max-w-2xl leading-relaxed text-bone-400">{s.description}</p>}
                  {s.features.length > 0 && (
                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {s.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-sm text-bone-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{f}</li>)}
                    </ul>
                  )}
                  <div className="mt-8 flex flex-col gap-5 border-t border-ink-600/70 pt-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-bone-600">Tarif</p>
                        <p className="font-display text-2xl font-semibold">{priceLabel(s)}</p>
                      </div>
                      {s.booking_mode === 'slot' && (
                        <div className="flex items-center gap-2 text-sm text-bone-400"><Clock className="h-4 w-4 text-ember" />{s.min_hours} à {s.max_hours} h par session</div>
                      )}
                      {s.allow_deposit && s.booking_mode === 'slot' && <div className="flex items-center gap-2 text-sm text-bone-400"><Wallet className="h-4 w-4 text-ember" />Acompte de {s.deposit_percent} % possible</div>}
                      {s.booking_mode === 'per_track' && s.allow_deposit && s.deposit_percent < 100 && <div className="flex items-center gap-2 text-sm text-bone-400"><Wallet className="h-4 w-4 text-ember" />Paiement en étapes : {[s.deposit_percent, s.milestone_percent, 100 - s.deposit_percent - (s.milestone_percent || 0)].filter((x) => x > 0).join(" % / ")} %</div>}
                    </div>
                    <Link to={bookLink(s)} className="group/btn flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-ember to-crimson px-6 text-sm font-bold text-white shadow-lg shadow-ember/20">
                      Réserver ce service <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {quote.length > 0 && (
          <div className="mt-24">
            <div className="reveal mb-10 max-w-2xl">
              <p className="eyebrow">Sur devis</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Création & accompagnement</h2>
              <p className="mt-3 text-bone-400">Ces prestations dépendent de votre projet : parlons-en pour établir un devis.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quote.map((s, i) => {
                const Icon = serviceIcon(s.slug);
                return (
                  <Link key={s.id} to={bookLink(s)} className="reveal group flex flex-col rounded-3xl border border-ink-600/70 bg-ink-800/50 p-7 transition hover:-translate-y-1 hover:border-ember/40" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                      {s.image_url ? <SmartImage src={s.image_url} alt="" className="absolute inset-0" imgClassName="group-hover:scale-105" /> : <LogoArt variant={logoVariantFor(i + 3)} compact />}
                    </div>
                    <Icon className="h-6 w-6 text-ember" />
                    <h3 className="mt-4 text-xl font-semibold">{s.name}</h3>
                    {s.tagline && <p className="mt-2 text-sm text-bone-400">{s.tagline}</p>}
                    {s.description && <p className="mt-2 text-sm text-bone-400">{s.description}</p>}
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-bone group-hover:text-ember">Demander un devis <ArrowRight className="h-4 w-4" /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Services;
