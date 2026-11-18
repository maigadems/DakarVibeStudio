import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Lock, Minus, Plus, ShieldCheck, Clock, CalendarDays } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { cx, fDate, fcfa, phoneDisplay } from '../../lib/format';
import type { DaySummary, Service, Slot } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { SlotPicker } from '../../components/SlotPicker';
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
  const hours = Math.max(service?.min_hours || 1, Math.min(Number(params.get('h')) || service?.min_hours || 1, service?.max_hours || 8));
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

  const total = service?.price ? service.price * (service.booking_mode === 'slot' ? hours : tracks) : 0;
  const deposit = !!service?.allow_deposit && paymentOption === 'deposit';
  const amountNow = deposit ? Math.ceil((total * (service?.deposit_percent || 100)) / 100) : total;
  const ready = !!service && (service.booking_mode !== 'slot' || !!start);
  const redirect = `/reservation?${params.toString()}`;

  const loadDays = useMemo(() => () => api<{ days: DaySummary[] }>(`/public/availability/days?service_id=${service?.id}&hours=${hours}`, { auth: false }).then((r) => r.days), [service?.id, hours]);
  const loadSlots = useMemo(() => (date: string) => api<{ slots: Slot[] }>(`/public/availability/slots?service_id=${service?.id}&hours=${hours}&date=${date}`, { auth: false }).then((r) => r.slots), [service?.id, hours]);

  const submit = async () => {
    if (!service) return;
    setSubmitError(null);
    setBusy(true);
    try {
      const r = await api<{ redirectUrl: string }>('/client/reservations', {
        method: 'POST',
        body: { service_id: service.id, start, hours, tracks, message, phone, payment_option: deposit ? 'deposit' : 'full' }
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
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Réservez votre <span className="serif-accent text-gradient">session.</span></h1>
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
                      <button key={s.id} type="button" onClick={() => update({ service: s.slug, start: null, h: null, t: null })}
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
                <Step n={2} title="Date et heure" done={!!start}
                  aside={
                    <div className="flex items-center gap-1 rounded-full border border-ink-600 p-1">
                      <button type="button" aria-label="Moins d’heures" disabled={hours <= service.min_hours} onClick={() => update({ h: String(hours - 1), start: null })} className="rounded-full p-1.5 hover:bg-ink-700 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-[52px] text-center text-sm font-semibold tabular-nums"><Clock className="mr-1 inline h-3.5 w-3.5 text-ember" />{hours} h</span>
                      <button type="button" aria-label="Plus d’heures" disabled={hours >= service.max_hours} onClick={() => update({ h: String(hours + 1), start: null })} className="rounded-full p-1.5 hover:bg-ink-700 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                  }>
                  {/* Durée de la session : choix rapides (heures consécutives) */}
                  <div className="mb-5">
                    <p className="label">Durée de la session</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 6, 8, service.max_hours]
                        .filter((h, i, all) => h >= service.min_hours && h <= service.max_hours && all.indexOf(h) === i)
                        .map((h) => (
                          <button key={h} type="button" onClick={() => update({ h: String(h), start: null })}
                            className={cx('rounded-full border px-4 py-2 text-sm font-semibold tabular-nums transition',
                              h === hours ? 'border-ember bg-ember text-white shadow-lg shadow-ember/25' : 'border-ink-600 bg-ink-900 text-bone-200 hover:border-ember/60')}>
                            {h === service.max_hours && h >= 10 ? `Journée · ${h} h` : `${h} h`}
                          </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-bone-600">
                      {hours} heure{hours > 1 ? 's' : ''} consécutive{hours > 1 ? 's' : ''} · {fcfa((service.price || 0) * hours)}. Seules les heures de début où toute la session est libre sont proposées.
                    </p>
                  </div>
                  <SlotPicker loadDays={loadDays} loadSlots={loadSlots} value={start} reloadKey={`${service.id}-${hours}-${reloadKey}`}
                    onChange={(s, slot) => { update({ start: s }); setSlotLabel(slot?.label || null); }} />
                </Step>
              )}

              {service?.booking_mode === 'per_track' && (
                <Step n={2} title="Nombre de titres" done>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-full border border-ink-600 p-1.5">
                      <button type="button" aria-label="Moins" disabled={tracks <= 1} onClick={() => update({ t: String(tracks - 1) })} className="rounded-full p-2 hover:bg-ink-700 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                      <span className="min-w-[48px] text-center font-display text-2xl font-semibold tabular-nums">{tracks}</span>
                      <button type="button" aria-label="Plus" disabled={tracks >= 50} onClick={() => update({ t: String(tracks + 1) })} className="rounded-full p-2 hover:bg-ink-700 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                    <p className="text-sm text-bone-400">titre{tracks > 1 ? 's' : ''} · {fcfa(service.price)} par titre</p>
                  </div>
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
                      {service.allow_deposit && (
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
                  <p className="mt-2 font-display text-xl font-semibold">{service?.name || 'Aucun service'}</p>
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
                  {deposit && <div className="flex justify-between"><dt className="text-bone-400">Reste avant la session</dt><dd>{fcfa(total - amountNow)}</dd></div>}
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
