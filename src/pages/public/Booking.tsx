import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Lock, Minus, Plus, ShieldCheck, CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { cx, fDate, fcfa, phoneDisplay } from '../../lib/format';
import type { Service } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { HourCalendar } from '../../components/HourCalendar';
import { Alert, Button, Field, Input, Spinner, Textarea, ErrorState } from '../../components/ui';
import { priceLabel, serviceIcon } from '../../components/site/Sections';

const Step: React.FC<{ n: number; title: string; done?: boolean; children: React.ReactNode; aside?: React.ReactNode }> = ({ n, title, done, children, aside }) => (
  <section className="card p-5 sm:p-7">
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className={cx('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', done ? 'bg-ember text-white' : 'bg-ink-600 text-bone-200')}>{done ? <Check className="h-4 w-4" /> : n}</span>
        {title}
      </h2>
      {aside}
    </div>
    {children}
  </section>
);

const Booking: React.FC = () => {
  useDocumentTitle('Réserver');
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useAsync(() => api<{ services: Service[] }>('/public/services', { auth: false }), []);
  const services = (data?.services || []).filter((s) => s.booking_mode !== 'quote');

  // L'état de la sélection est conservé dans l'URL : il survit à la connexion / inscription
  const service = services.find((s) => s.slug === params.get('service')) || null;
  const hours = Math.max(1, Math.min(Number(params.get('h')) || 1, service?.max_hours || 8));
  const tracks = Math.max(1, Math.min(Number(params.get('t')) || 1, 50));
  const start = params.get('start');
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  const [slotLabel, setSlotLabel] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => { if (user?.phone && !phone) setPhone(phoneDisplay(user.phone)); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const endLabel = start ? `${start.slice(11, 13)}h00 – ${String((Number(start.slice(11, 13)) + hours) % 24).padStart(2, '0')}h00` : null;

  // Commande au titre : mastering en option sur un mixage, échéancier fixé par le studio
  const isOrder = service?.booking_mode === 'per_track';
  const mastering = (data?.services || []).find((s) => s.slug === 'mastering' && s.booking_mode === 'per_track' && !!s.price);
  const canAddMastering = service?.slug === 'mixage' && !!mastering;
  const withMastering = canAddMastering && params.get('m') === '1';
  const total = service?.price ? service.price * (isOrder ? tracks : hours) + (withMastering ? (mastering!.price || 0) * tracks : 0) : 0;
  const plan = (() => {
    if (!isOrder || !service) return [];
    const dep = service.allow_deposit ? service.deposit_percent : 100;
    const mid = Math.min(100 - dep, service.milestone_percent || 0);
    const steps = [{ label: 'À la commande (acompte)', percent: dep }];
    if (mid > 0) steps.push({ label: 'Aux premiers livrables', percent: mid });
    if (100 - dep - mid > 0) steps.push({ label: 'À la livraison finale', percent: 100 - dep - mid });
    const amounts = steps.map((x) => Math.round((total * x.percent) / 100));
    amounts[amounts.length - 1] = total - amounts.slice(0, -1).reduce((a, b) => a + b, 0);
    return steps.map((x, i) => ({ ...x, amount: amounts[i] }));
  })();
  const deposit = isOrder ? plan.length > 1 : !!service?.allow_deposit && paymentOption === 'deposit';
  const amountNow = isOrder ? plan[0]?.amount || 0 : deposit ? Math.ceil((total * (service?.deposit_percent || 100)) / 100) : total;
  const ready = !!service && (service.booking_mode !== 'slot' || (!!start && hours >= (service.min_hours || 1)));
  const redirect = `/reservation?${params.toString()}`;


  const submit = async () => {
    if (!service) return;
    setSubmitError(null);
    setBusy(true);
    try {
      const r = await api<{ redirectUrl: string }>('/client/reservations', {
        method: 'POST',
        body: { service_id: service.id, start, hours, tracks, message, phone, payment_option: deposit ? 'deposit' : 'full', with_mastering: withMastering }
      });
      window.location.href = r.redirectUrl; // page de paiement PayTech
    } catch (e: any) {
      setSubmitError(e.message);
      if (e.code === 'SLOT_TAKEN' || e.code === 'SLOT_UNAVAILABLE') { update({ start: null }); setReloadKey((k) => k + 1); }
      setBusy(false);
    }
  };

  return (
    <div className="pb-24 pt-28 sm:pt-36">
      <div className="container-x">
        <p className="eyebrow">Réservation</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{isOrder ? <>Passez votre <span className="serif-accent text-gradient">commande.</span></> : <>Réservez votre <span className="serif-accent text-gradient">session.</span></>}</h1>
        <p className="mt-3 max-w-xl text-bone-400">Créneaux mis à jour en temps réel. Le créneau est bloqué pour vous pendant le paiement.</p>

        {loading && <Spinner label="Chargement des services…" />}
        {error && <div className="mt-10"><ErrorState message={error} onRetry={reload} /></div>}

        {!loading && !error && (
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Step n={1} title="Choisissez un service" done={!!service}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {services.map((s) => {
                    const Icon = serviceIcon(s.slug);
                    const active = s.id === service?.id;
                    return (
                      <button key={s.id} type="button" onClick={() => update({ service: s.slug, start: null, h: null, t: null, m: null })}
                        className={cx('rounded-2xl border p-4 text-left transition', active ? 'border-ember bg-ember/10 ring-1 ring-ember/40' : 'border-ink-600 bg-ink-900 hover:border-ember/50')}>
                        <Icon className={cx('h-5 w-5', active ? 'text-ember' : 'text-bone-400')} />
                        <p className="mt-3 font-semibold">{s.name}</p>
                        <p className="mt-1 text-xs text-bone-400">{priceLabel(s)}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-bone-600">Composition, voix off, jingle… ? <Link to="/services" className="text-bone-400 underline-offset-2 hover:underline">Ces services sont sur devis</Link>.</p>
              </Step>

              {service?.booking_mode === 'slot' && (
                <Step n={2} title="Date et heure" done={!!start && hours >= service.min_hours}>
                  {/* Calendrier de l'ancienne version : plusieurs créneaux consécutifs = plusieurs heures */}
                  <HourCalendar serviceId={service.id} minHours={service.min_hours} maxHours={service.max_hours} price={service.price || 0}
                    start={start} hours={hours} reloadKey={reloadKey}
                    onChange={(st, h) => { update({ start: st, h: String(h) }); setSlotLabel(null); }} />
                </Step>
              )}

              {service?.booking_mode === 'per_track' && (
                <Step n={2} title="Votre commande" done>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-full border border-ink-600 p-1.5">
                      <button type="button" aria-label="Moins" disabled={tracks <= 1} onClick={() => update({ t: String(tracks - 1) })} className="rounded-full p-2 hover:bg-ink-700 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-[48px] text-center font-display text-2xl font-semibold tabular-nums">{tracks}</span>
                      <button type="button" aria-label="Plus" disabled={tracks >= 50} onClick={() => update({ t: String(tracks + 1) })} className="rounded-full p-2 hover:bg-ink-700 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                    <p className="text-sm text-bone-400">titre{tracks > 1 ? 's' : ''} · {fcfa(service.price)} par titre</p>
                  </div>

                  {canAddMastering && (
                    <button type="button" onClick={() => update({ m: withMastering ? null : '1' })} aria-pressed={withMastering}
                      className={cx('mt-5 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition', withMastering ? 'border-ember bg-ember/10 ring-1 ring-ember/40' : 'border-ink-600 bg-ink-900 hover:border-ember/50')}>
                      <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition', withMastering ? 'border-ember bg-ember text-white' : 'border-ink-500')}>{withMastering && <Check className="h-4 w-4" />}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">Ajouter le mastering</span>
                        <span className="block text-sm text-bone-400">Finalisation de {tracks > 1 ? 'vos titres' : 'votre titre'} après le mixage · +{fcfa(mastering!.price)} par titre</span>
                      </span>
                    </button>
                  )}

                  {plan.length > 1 && (
                    <div className="mt-5 rounded-2xl border border-ink-600 bg-ink-900 p-4">
                      <p className="label">Paiement en {plan.length} étapes</p>
                      <ol className="mt-2 space-y-2">
                        {plan.map((x, i) => (
                          <li key={x.label} className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex items-center gap-2.5"><span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', i === 0 ? 'bg-ember text-white' : 'bg-ink-600 text-bone-200')}>{i + 1}</span>{x.label} · {x.percent} %</span>
                            <span className="font-semibold tabular-nums">{fcfa(x.amount)}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-xs text-bone-600">Seul l’acompte est réglé aujourd’hui. Les étapes suivantes vous sont demandées par le studio (WhatsApp et espace client) au fil de la production.</p>
                    </div>
                  )}
                </Step>
              )}

              {service && (
                <Step n={3} title="Vos informations" done={!!user && !!phone}>
                  {!user ? (
                    <div className="flex flex-col items-start gap-4 rounded-2xl border border-ember/25 bg-ember/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-3">
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                        <p className="text-sm text-bone-200">Connectez-vous ou créez un compte pour finaliser. Votre sélection est conservée.</p>
                      </div>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <Button to={`/connexion?redirect=${encodeURIComponent(redirect)}`} variant="subtle" className="flex-1 sm:flex-none">Connexion</Button>
                        <Button to={`/inscription?redirect=${encodeURIComponent(redirect)}`} className="flex-1 sm:flex-none">Créer un compte</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Nom"><Input value={`${user.first_name} ${user.last_name}`.trim()} disabled /></Field>
                        <Field label="Téléphone WhatsApp" hint="Confirmation, rappel 2 h avant et lien de paiement.">
                          <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 000 00 00" />
                        </Field>
                      </div>
                      <Field label="Remarques pour l’équipe (facultatif)"><Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type de projet, nombre de personnes, besoins particuliers…" /></Field>
                      {service.allow_deposit && !isOrder && (
                        <div>
                          <p className="label">Paiement maintenant</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {(['deposit', 'full'] as const).map((opt) => (
                              <button key={opt} type="button" onClick={() => setPaymentOption(opt)}
                                className={cx('rounded-2xl border p-4 text-left transition', paymentOption === opt ? 'border-ember bg-ember/10 ring-1 ring-ember/40' : 'border-ink-600 bg-ink-900 hover:border-ember/50')}>
                                <p className="font-semibold">{opt === 'deposit' ? `Acompte ${service.deposit_percent} %` : 'Paiement total'}</p>
                                <p className="mt-1 text-sm text-bone-400">{opt === 'deposit' ? `${fcfa(Math.ceil((total * service.deposit_percent) / 100))} maintenant, le reste avant la session` : `${fcfa(total)} maintenant`}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Step>
              )}
            </div>

            {/* Récapitulatif */}
            <aside className="lg:col-span-4">
              <div className="card sticky top-24 overflow-hidden">
                <div className="border-b border-ink-600/70 bg-gradient-to-br from-ember/15 to-transparent p-6">
                  <p className="eyebrow">Récapitulatif</p>
                  <p className="mt-2 font-display text-xl font-semibold">{service ? `${service.name}${withMastering ? ` + ${mastering!.name}` : ''}` : 'Aucun service'}</p>
                </div>
                <dl className="space-y-3 p-6 text-sm">
                  {service?.booking_mode === 'slot' && (
                    <>
                      <div className="flex justify-between gap-4"><dt className="text-bone-400">Date</dt><dd className="text-right">{start ? fDate(start) : '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-400">Horaire</dt><dd>{start ? slotLabel || endLabel : '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-400">Durée</dt><dd>{hours} h</dd></div>
                    </>
                  )}
                  {service?.booking_mode === 'per_track' && <div className="flex justify-between"><dt className="text-bone-400">Titres</dt><dd>{tracks}</dd></div>}
                  <div className="flex justify-between border-t border-ink-600/70 pt-3"><dt className="text-bone-400">Total</dt><dd className="font-semibold">{fcfa(total)}</dd></div>
                  {deposit && <div className="flex justify-between"><dt className="text-bone-400">{isOrder ? 'Reste pendant la production' : 'Reste avant la session'}</dt><dd>{fcfa(total - amountNow)}</dd></div>}
                  <div className="flex items-end justify-between pt-2"><dt className="font-semibold">À payer maintenant</dt><dd className="font-display text-2xl font-semibold text-gradient">{fcfa(amountNow)}</dd></div>
                </dl>
                <div className="space-y-3 p-6 pt-0">
                  {submitError && <Alert>{submitError}</Alert>}
                  <Button size="lg" className="w-full" disabled={!ready || !user || !phone} loading={busy} onClick={submit} icon={!busy ? <ArrowRight className="h-4 w-4" /> : undefined}>
                    Confirmer et payer
                  </Button>
                  <p className="flex items-center justify-center gap-2 text-xs text-bone-600"><ShieldCheck className="h-3.5 w-3.5" />Paiement sécurisé PayTech</p>
                  {service?.booking_mode === 'slot' && <p className="flex items-start gap-2 text-xs text-bone-600"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />Report gratuit en ligne jusqu’à 2 h avant la session.</p>}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
