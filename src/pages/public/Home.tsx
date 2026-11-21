// Page d'accueil : textes repris de la version précédente du site, nouvelle mise en page.
// Aucune photo de personne : visuels = logo et photos ajoutées par le studio dans la galerie.
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ExternalLink, Music, Users, Volume2, Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle, useReveal } from '../../lib/hooks';
import { useConfig } from '../../context/ConfigContext';
import type { Equipment, GalleryPhoto, Service } from '../../lib/types';
import { EquipmentCard, SectionTitle, ServiceCard } from '../../components/site/Sections';
import { ProductionCard, type Production } from '../../components/Productions';
import { Lightbox } from '../../components/Lightbox';
import { PhotoMasonry } from '../../components/PhotoMasonry';
import { LogoArt } from '../../components/media';

const Waveform: React.FC<{ bars?: number; className?: string }> = ({ bars = 48, className }) => {
  const heights = useMemo(() => Array.from({ length: bars }, (_, i) => 20 + Math.round(Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.17)) * 80)), [bars]);
  return (
    <div className={`flex h-12 items-center gap-[3px] ${className || ''}`} aria-hidden>
      {heights.map((h, i) => (
        <span key={i} className="w-[2px] origin-center animate-wave rounded-full bg-gradient-to-t from-ember to-crimson" style={{ height: `${h}%`, animationDelay: `${(i % 12) * 0.1}s`, animationDuration: `${1.1 + (i % 5) * 0.15}s` }} />
      ))}
    </div>
  );
};

// Section « Nouveaux Services » de l'ancien site (textes d'origine)
const NEW_SERVICES = [
  {
    name: 'Voix off',
    icon: Volume2,
    text: 'Enregistrement professionnel de voix off pour vos publicités, documentaires, présentations et contenus multimédias.',
    features: ['Voix masculine et féminine disponibles', 'Enregistrement en cabine insonorisée', 'Traitement audio professionnel', 'Formats multiples (MP3, WAV)']
  },
  {
    name: 'Conception de jingle',
    icon: Music,
    text: 'Création de jingles personnalisés pour radios, podcasts, chaînes YouTube et événements d’entreprise.',
    features: ['Composition originale sur mesure', 'Durée adaptée à vos besoins', 'Style musical personnalisé', 'Révisions incluses']
  }
];

const Home: React.FC = () => {
  useDocumentTitle('');
  const navigate = useNavigate();
  const { settings } = useConfig();
  const pageRef = useReveal<HTMLDivElement>();
  const [viewer, setViewer] = useState<{ items: { url: string; title?: string | null; description?: string | null }[]; index: number } | null>(null);

  const { data } = useAsync(async () => {
    const [s, e, g, pr] = await Promise.all([
      api<{ services: Service[] }>('/public/services', { auth: false }),
      api<{ equipment: Equipment[] }>('/public/equipment', { auth: false }),
      api<{ photos: GalleryPhoto[] }>('/public/gallery', { auth: false }),
      api<{ productions: Production[] }>('/public/productions', { auth: false }).catch(() => ({ productions: [] as Production[] }))
    ]);
    return { services: s.services, equipment: e.equipment, gallery: g.photos, productions: pr.productions };
  }, []);

  // Ancien retour PayTech (?payment=...) : redirigé vers la nouvelle page de retour
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('payment')) navigate(`/paiement/retour?status=${p.get('payment') === 'success' ? 'success' : 'cancel'}`, { replace: true });
  }, [navigate]);

  const services = data?.services || [];
  // Les productions mises en avant d'abord, puis les plus récentes (ordre défini par Jeuss)
  const productions = [...(data?.productions || [])].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  const bookable = services.filter((s) => s.booking_mode !== 'quote');
  const featuredServices = (bookable.filter((s) => s.is_featured).length ? bookable.filter((s) => s.is_featured) : bookable).slice(0, 3);
  const equipment = useMemo(() => data?.equipment || [], [data]);
  const featuredEquipment = equipment.filter((e) => e.is_featured);
  // Uniquement les photos ajoutées par le studio depuis l'administration
  const gallery = (data?.gallery || []).filter((p, _, all) => (all.filter((x) => x.is_featured).length >= 3 ? p.is_featured : true)).slice(0, 6);
  const categories = useMemo(() => {
    const map = new Map<string, Equipment[]>();
    equipment.forEach((e) => map.set(e.category || 'Matériel', [...(map.get(e.category || 'Matériel') || []), e]));
    return [...map.entries()];
  }, [equipment]);
  const studioName = (settings.studio_name || 'Westaf Records').toUpperCase();

  return (
    <div ref={pageRef}>
      {/* ============================================================ HERO */}
      <section className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-ink">
          <div className="absolute left-[10%] top-1/4 h-[28rem] w-[28rem] animate-pulse rounded-full bg-ember/20 blur-[130px]" />
          <div className="absolute bottom-[10%] right-[8%] h-[26rem] w-[26rem] animate-pulse rounded-full bg-crimson/20 blur-[130px] [animation-delay:1s]" />
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-amberish/10 blur-[110px] [animation-delay:.5s]" />
          <img src="/WestAf Record-15.jpg" alt="" className="absolute -right-24 top-1/2 hidden w-[46rem] -translate-y-1/2 opacity-[0.07] mix-blend-screen lg:block" />
        </div>

        <div className="container-x pb-16 pt-32 text-center">
          <div className="mx-auto mb-10 w-fit animate-fade-up">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-gradient-to-r from-ember to-crimson p-[2px] shadow-2xl shadow-ember/40 sm:h-32 sm:w-32">
                <img src="/logo.jpg" alt={`Logo ${settings.studio_name}`} className="h-full w-full rounded-full object-cover" />
              </div>
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-r from-ember to-crimson opacity-40 blur-2xl" />
            </div>
          </div>

          <h1 className="animate-fade-up text-[2.9rem] font-bold leading-none sm:text-7xl lg:text-8xl" style={{ animationDelay: '100ms' }}>
            <span className="text-gradient">{studioName}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl animate-fade-up text-lg text-bone-200 sm:text-2xl" style={{ animationDelay: '180ms' }}>
            Studio d’enregistrement professionnel à Dakar
            <span className="mt-1 block serif-accent text-2xl text-ember-400 sm:text-3xl">Créez votre son unique</span>
          </p>

          <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: '260ms' }}>
            {[{ i: Volume2, t: 'Voix off' }, { i: Music, t: 'Conception de jingle' }, { i: Music, t: 'Composition musicale' }].map(({ i: I, t }) => (
              <span key={t} className="flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-4 py-2 text-sm text-bone">
                <I className="h-4 w-4 text-ember" />{t}
              </span>
            ))}
          </div>

          <div className="mt-12 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: '340ms' }}>
            <Link to="/reservation" className="group flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ember to-crimson px-8 text-[15px] font-bold text-white shadow-xl shadow-ember/30 transition hover:shadow-ember/50">
              Réserver Une Session <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a href="#a-propos" className="flex h-14 items-center justify-center gap-2 rounded-full border border-ember/60 px-8 text-[15px] font-semibold text-ember-400 transition hover:bg-ember hover:text-white">
              Découvrir le Studio
            </a>
          </div>

          <Waveform bars={56} className="mx-auto mt-16 h-10 w-fit animate-fade-in opacity-60" />
        </div>
      </section>

      {/* ============================================================ BANDEAU SERVICES */}
      {services.length > 0 && (
        <div className="overflow-hidden border-y border-ink-600/60 bg-ink-900 py-5" aria-hidden>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-semibold uppercase tracking-wide text-bone-600 sm:text-3xl">
            {[...services, ...services].map((s, i) => (
              <span key={i} className="flex items-center gap-10">{s.name}<span className="h-2 w-2 rounded-full bg-ember" /></span>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ À PROPOS */}
      <section id="a-propos" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
        <div className="container-x">
          <div className="reveal mx-auto mb-16 max-w-3xl text-center">
            <p className="eyebrow">À propos</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl">À Propos de <span className="text-gradient">Westaf Studio</span></h2>
            <p className="mt-6 text-lg leading-relaxed text-bone-400">
              Un studio d’enregistrement moderne au cœur de Dakar, équipé des dernières technologies pour donner vie à vos projets musicaux.
            </p>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="reveal">
              <h3 className="text-3xl font-semibold">Notre <span className="serif-accent text-gradient">Vision</span></h3>
              <p className="mt-6 leading-relaxed text-bone-400">
                Westaf Studio est né de la passion pour la musique et de l’envie de créer un espace où les artistes peuvent exprimer leur créativité sans limites. Nous combinons l’expertise technique avec une approche artistique pour offrir des productions de qualité internationale.
              </p>
              <p className="mt-4 leading-relaxed text-bone-400">
                Notre mission est de démocratiser l’accès à un enregistrement professionnel tout en préservant l’authenticité et l’originalité de chaque artiste.
              </p>
            </div>
            <div className="reveal relative" style={{ transitionDelay: '120ms' }}>
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-ember/20 via-transparent to-crimson/20 blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] border border-ember/30 shadow-2xl">
                <img src="/WestAf Record-15.jpg" alt="Westaf Records" loading="lazy" className="aspect-square w-full object-cover sm:aspect-[4/3]" />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {[
              { icon: Users, t: 'Équipe Experte', d: 'Ingénieurs du son certifiés et producteurs expérimentés pour vous accompagner dans tous vos projets musicaux.' },
              { icon: Zap, t: 'Innovation', d: 'Techniques d’enregistrement modernes et créatives pour créer un son unique qui vous démarque de la concurrence.' }
            ].map((c, i) => (
              <div key={c.t} className="reveal rounded-3xl border border-ink-600/70 bg-gradient-to-b from-ember/10 to-transparent p-8 transition hover:border-ember/40" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-ember to-crimson"><c.icon className="h-7 w-7 text-white" /></span>
                <h3 className="mt-6 text-2xl font-semibold">{c.t}</h3>
                <p className="mt-3 leading-relaxed text-bone-400">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ ÉQUIPEMENT PRO */}
      {equipment.length > 0 && (
        <section className="border-y border-ink-600/60 bg-ink-900 py-24 sm:py-32">
          <div className="container-x">
            <SectionTitle eyebrow="Équipements" title={<>Équipement <span className="text-gradient">Pro</span></>}
              action={<Link to="/equipements" className="group inline-flex items-center gap-2 text-sm font-semibold hover:text-ember">Tout le matériel <ArrowUpRight className="h-4 w-4" /></Link>} />
            {featuredEquipment.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredEquipment.slice(0, 5).map((e, i) => <EquipmentCard key={e.id} item={e} index={i} large={i === 0 && featuredEquipment.length >= 3} onOpen={() => setViewer({ items: e.photos.map((x) => ({ url: x.url, title: e.name, description: e.description })), index: 0 })} />)}
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-12">
              <div className="reveal relative h-72 overflow-hidden rounded-3xl border border-ink-600/60 lg:col-span-4 lg:h-auto lg:min-h-[420px]"><LogoArt variant="equalizer" /></div>
              <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
                {categories.map(([cat, items], i) => (
                  <div key={cat} className="reveal border-t border-ink-600 pt-6" style={{ transitionDelay: `${i * 60}ms` }}>
                    <p className="eyebrow mb-4">{cat}</p>
                    <ul className="space-y-2">
                      {items.map((e) => <li key={e.id} className="font-display text-lg font-medium text-bone-200">{e.name}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              </div>
            )}
          </div>
          <Lightbox items={viewer?.items || []} index={viewer ? viewer.index : null} onChange={(i) => setViewer((v) => (i === null || !v ? null : { ...v, index: i }))} />
        </section>
      )}

      {/* ============================================================ TARIFS / SERVICES */}
      {featuredServices.length > 0 && (
        <section className="relative py-24 sm:py-32">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-crimson/10 blur-[120px]" />
          <div className="container-x relative">
            <SectionTitle eyebrow="Services" title={<>Nos <span className="text-gradient">Tarifs</span></>}
              text="Studio disponible 6j/7 - Réservation par heure"
              action={<Link to="/services" className="group inline-flex items-center gap-2 text-sm font-semibold hover:text-ember">Tous les services <ArrowUpRight className="h-4 w-4" /></Link>} />
            <div className="grid gap-5 md:grid-cols-3">
              {featuredServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ NOUVEAUX SERVICES */}
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <SectionTitle eyebrow="Nouveau" title={<>Nouveaux <span className="text-gradient">Services</span></>} text="Découvrez nos dernières offres pour enrichir vos projets audio" />
          <div className="grid gap-5 md:grid-cols-2">
            {NEW_SERVICES.map((s, i) => (
              <article key={s.name} className="reveal relative flex flex-col overflow-hidden rounded-3xl border border-ink-600/70 bg-ink-800/60 p-8 transition hover:border-ember/40" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="relative -mx-8 -mt-8 mb-8 h-44 overflow-hidden border-b border-ink-600/60"><LogoArt variant={i === 0 ? 'pulse' : 'float'} compact /></div>
                <span className="absolute right-6 top-6 z-10 rounded-full bg-gradient-to-r from-ember to-crimson px-3 py-1 text-[10px] font-bold tracking-wider text-white">NOUVEAU</span>
                <s.icon className="h-8 w-8 text-ember" />
                <h3 className="mt-6 text-2xl font-semibold">{s.name}</h3>
                <p className="mt-3 leading-relaxed text-bone-400">{s.text}</p>
                <ul className="mt-5 space-y-2">
                  {s.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-sm text-bone-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{f}</li>)}
                </ul>
                <Link to={`/contact?service=${encodeURIComponent(s.name)}`} className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-bone px-6 text-sm font-bold text-ink transition hover:bg-white">
                  Demander un Devis <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ GALERIE (photos ajoutées par le studio) */}
      <section className="border-t border-ink-600/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionTitle eyebrow="Galerie" title={<>Le <span className="text-gradient">studio</span></>}
            action={<Link to="/studio" className="group inline-flex items-center gap-2 text-sm font-semibold hover:text-ember">Toute la galerie <ArrowUpRight className="h-4 w-4" /></Link>} />
          {gallery.length > 0 ? (
            <PhotoMasonry photos={gallery} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
              <div className="reveal relative h-72 overflow-hidden rounded-3xl border border-ink-600/60 sm:col-span-2 sm:row-span-2 sm:h-auto sm:min-h-[460px]"><LogoArt variant="orbit" /></div>
              <div className="reveal relative h-56 overflow-hidden rounded-3xl border border-ink-600/60" style={{ transitionDelay: '100ms' }}><LogoArt variant="equalizer" compact /></div>
              <div className="reveal relative h-56 overflow-hidden rounded-3xl border border-ink-600/60" style={{ transitionDelay: '200ms' }}><LogoArt variant="shine" compact /></div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ DERNIÈRES PRODUCTIONS (gérées dans Admin → Productions) */}
      {productions.length > 0 && (
        <section className="border-t border-ink-600/60 bg-ink-900 py-24 sm:py-32">
          <div className="container-x">
            <SectionTitle eyebrow="Productions" title={<>Nos dernières <span className="text-gradient">productions</span></>}
              text="Découvrez quelques-unes de nos compositions musicales réalisées dans notre studio"
              action={settings.productions_playlist_url ? (
                <a href={settings.productions_playlist_url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm font-semibold hover:text-ember">
                  Découvrez toutes nos productions <ExternalLink className="h-4 w-4" />
                </a>
              ) : undefined} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {productions.slice(0, 6).map((p, i) => <ProductionCard key={p.id} p={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ CONTACT / CTA */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="reveal grain relative isolate overflow-hidden rounded-[2.5rem] border border-ember/20 px-6 py-16 text-center sm:px-12 sm:py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(242,107,33,.35),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(217,58,58,.25),transparent_55%)]" />
            <div className="absolute inset-0 -z-20 bg-ink-800" />
            <Waveform bars={64} className="mx-auto mb-10 h-10 w-fit opacity-70" />
            <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.02] sm:text-6xl">Contactez-Nous</h2>
            <p className="mx-auto mt-6 max-w-lg text-bone-200">Prêt à créer votre prochain hit ? Contactez-nous dès maintenant pour discuter de votre projet.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/reservation" className="flex h-14 items-center justify-center gap-2 rounded-full bg-bone px-8 font-bold text-ink transition hover:bg-white">Réserver Une Session <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="flex h-14 items-center justify-center gap-2 rounded-full border border-bone/25 px-8 font-semibold transition hover:border-bone/60">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
