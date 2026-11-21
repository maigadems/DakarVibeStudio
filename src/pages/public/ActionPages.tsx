import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MessageCircle, FileText, CheckCircle2, XCircle, Banknote, CreditCard, CalendarClock, CalendarCheck2, Hourglass, Home as HomeIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { useDocumentTitle } from '../../lib/hooks';
import { fDate, fRange, fcfa } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { Alert, Button, Spinner } from '../../components/ui';
import type { Milestone, Reservation } from '../../lib/types';
import { DownloadInvoiceButton } from '../../components/InvoiceDocument';
import { Linkify, OrderSteps } from '../../components/OrderSteps';
import { Directions } from '../../components/Directions';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative flex min-h-[80vh] items-center justify-center px-4 pb-20 pt-32">
    <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-ember/15 blur-[120px]" />
    <div className="card relative w-full max-w-lg animate-scale-in p-7 text-center sm:p-10">{children}</div>
  </div>
);

// Message « Confirmer par WhatsApp » de l'ancienne version, envoyé par le client au studio
const fmtN = (n?: number | null) => Number(n || 0).toLocaleString('fr-FR');
const buildWhatsAppMessage = (r: Reservation | null, reference: string | null) => {
  if (!r) return `Bonjour, je viens d'effectuer le paiement de ma réservation.${reference ? ` Réf : ${reference}` : ''}`;
  const lines = [
    'Bonjour Westaf Records,',
    'Je confirme ma réservation après paiement :',
    '',
    `👤 Nom : ${r.nom}`,
    `📞 Téléphone : ${r.telephone}`,
    ...(r.email ? [`✉️ Email : ${r.email}`] : []),
    `🎙️ Service choisi : ${r.service_name}`
  ];
  if (r.start_at) {
    lines.push(`📅 Date : ${fDate(r.start_at)}`);
    lines.push(`🕒 Créneau : ${fRange(r.start_at, r.end_at)}`);
    if (r.duree_heures) lines.push(`⏱️ Durée : ${r.duree_heures} heure(s)`);
  } else if (r.nombre_titres) {
    lines.push(`🎵 Nombre de titres : ${r.nombre_titres}`);
  }
  lines.push('');
  lines.push(`💰 Montant total : ${fmtN(r.montant_total)} FCFA`);
  lines.push(`✅ Montant payé : ${fmtN(r.montant_paye)} FCFA`);
  if (r.solde) lines.push(`Reste à payer : ${fmtN(r.solde)} FCFA`);
  if (reference) lines.push(`Réf : ${reference}`);
  return lines.join('\n');
};
const waLink = (phone: string | null | undefined, text: string) => {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 9) d = `221${d}`;
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : null;
};

// ------------------------------------------------------------------ Retour PayTech
export const PaymentReturn: React.FC = () => {
  useDocumentTitle('Paiement');
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { settings } = useConfig();
  const success = params.get('status') === 'success';
  const resId = params.get('r');
  const [res, setRes] = useState<Reservation | null>(null);
  const [tries, setTries] = useState(0);

  // L'IPN de PayTech peut arriver quelques secondes après le retour : on vérifie le statut
  useEffect(() => {
    if (!success || !resId || !user || user.role !== 'client') return;
    let stop = false;
    const check = async () => {
      try {
        const r = await api<{ reservation: Reservation }>(`/client/reservations/${resId}`);
        if (stop) return;
        setRes(r.reservation);
        const confirmed = r.reservation.statut === 'confirmee' || r.reservation.statut === 'terminee';
        if (!confirmed && tries < 10) setTimeout(() => setTries((t) => t + 1), 3000);
      } catch { /* réservation non visible : ignoré */ }
    };
    check();
    return () => { stop = true; };
  }, [success, resId, user, tries]);

  if (!success) {
    return (
      <Shell>
        <XCircle className="mx-auto h-14 w-14 text-[#F07A7A]" />
        <h1 className="mt-5 text-2xl font-semibold">Paiement annulé</h1>
        <p className="mt-3 text-bone-400">Aucun montant n’a été prélevé. Votre créneau reste bloqué quelques minutes : vous pouvez reprendre le paiement depuis votre espace.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to="/mon-espace/reservations">Mes réservations</Button>
          <Button to="/reservation" variant="outline">Nouvelle réservation</Button>
        </div>
      </Shell>
    );
  }

  const confirmed = res && (res.statut === 'confirmee' || res.statut === 'terminee');
  return (
    <Shell>
      {confirmed || !resId || !user ? <CheckCircle2 className="mx-auto h-14 w-14 text-sage" /> : <Hourglass className="mx-auto h-14 w-14 animate-pulse text-amberish" />}
      <h1 className="mt-5 text-2xl font-semibold">{confirmed || !resId || !user ? 'Paiement reçu, merci !' : 'Confirmation en cours…'}</h1>
      {res ? (
        <div className="mt-5 space-y-1 text-bone-200">
          <p className="font-semibold">{res.service_name}</p>
          {res.start_at && <p className="text-sm text-bone-400">{fDate(res.start_at)} · {fRange(res.start_at, res.end_at)}</p>}
          {res.start_at && <Directions compact className="justify-center pt-3" />}
          {!!res.solde && confirmed && <p className="pt-2 text-sm text-bone-400">Reste à régler avant la session : <strong className="text-bone">{fcfa(res.solde)}</strong></p>}
        </div>
      ) : (
        <p className="mt-3 text-bone-400">Votre réservation sera confirmée dès la validation du paiement par PayTech. Vous recevrez une confirmation sur WhatsApp.</p>
      )}
      {res?.invoice_id && confirmed && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-ink-600 bg-ink-900 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-ember" />Votre facture est prête</p>
          <p className="text-xs text-bone-600">Elle vous a aussi été envoyée par WhatsApp et par e-mail.</p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <DownloadInvoiceButton scope="client" id={res.invoice_id} number={`${res.invoice_id}`} label="Télécharger la facture" />
            <Button size="sm" variant="ghost" to={`/mon-espace/factures/${res.invoice_id}`}>Voir</Button>
          </div>
        </div>
      )}
      {res && !confirmed && tries >= 10 && <Alert tone="warning" className="mt-5 text-left">La confirmation de PayTech prend plus de temps que prévu. Elle apparaîtra dans votre espace dès réception.</Alert>}
      {(() => {
        const url = waLink(settings.contact_phone, buildWhatsAppMessage(res, params.get('ref')));
        return url ? (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
            <MessageCircle size={18} /> Confirmer par WhatsApp
          </a>
        ) : null;
      })()}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button to="/mon-espace/reservations">Voir mes réservations</Button>
        <Button to="/" variant="outline" icon={<HomeIcon className="h-4 w-4" />}>Accueil</Button>
      </div>
    </Shell>
  );
};

interface ActionSummary {
  id: string; first_name: string; service_name: string; start_at: string | null; end_at: string | null; statut: string;
  session_status: string; presence_status: string; payment_status: string; amount_due: number; montant_total: number;
  can_reschedule_online: boolean; reschedule_limit_minutes: number;
  is_order?: boolean; nombre_titres?: number | null;
  milestone?: { id: number; label: string; amount: number; percent: number; status: string; deliverable_note: string | null } | null;
  milestones?: { label: string; percent: number; amount: number; status: string }[];
}

const useAction = (token?: string) => {
  const [data, setData] = useState<ActionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ reservation: ActionSummary }>(`/actions/${token}`, { auth: false }).then((r) => setData(r.reservation)).catch((e) => setError(e.message));
  }, [token]);
  return { data, setData, error };
};

// ------------------------------------------------------------------ Lien de paiement du solde (WhatsApp)
export const PaymentAction: React.FC = () => {
  useDocumentTitle('Régler ma session');
  const { token } = useParams();
  const { data, setData, error } = useAction(token);
  const [busy, setBusy] = useState<'online' | 'cash' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const online = async () => {
    setBusy('online'); setErr(null);
    try { window.location.href = (await api<{ redirectUrl: string }>(`/actions/${token}/pay-online`, { method: 'POST', auth: false })).redirectUrl; }
    catch (e: any) { setErr(e.message); setBusy(null); }
  };
  const cash = async () => {
    setBusy('cash'); setErr(null);
    try { setData((await api<{ reservation: ActionSummary }>(`/actions/${token}/pay-cash`, { method: 'POST', auth: false })).reservation); }
    catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  };

  if (error) return <Shell><XCircle className="mx-auto h-12 w-12 text-[#F07A7A]" /><p className="mt-4">{error}</p></Shell>;
  if (!data) return <Shell><Spinner /></Shell>;

  // Commande payée par étapes (mixage, mastering…)
  if (data.is_order) {
    const m = data.milestone;
    const allPaid = (data.milestones || []).every((x) => x.status === 'paye');
    return (
      <Shell>
        <p className="eyebrow">Votre commande</p>
        <h1 className="mt-3 text-2xl font-semibold">Bonjour {data.first_name}</h1>
        <p className="mt-2 text-bone-400">{data.service_name} · {data.nombre_titres || 1} titre{(data.nombre_titres || 1) > 1 ? 's' : ''}</p>
        {m?.deliverable_note && (
          <div className="mt-6 rounded-2xl border border-ink-600 bg-ink-900 p-4 text-left text-sm">
            <p className="text-xs uppercase tracking-wider text-bone-600">Livrables</p>
            <p className="mt-1 text-bone-200"><Linkify text={m.deliverable_note} /></p>
          </div>
        )}
        {m?.status === 'demande' && data.statut !== 'annulee' ? (
          <>
            <div className="mt-6 rounded-2xl border border-ink-600 bg-ink-900 p-6">
              <p className="text-xs uppercase tracking-wider text-bone-600">{m.label} · {m.percent} %</p>
              <p className="mt-1 font-display text-4xl font-semibold text-gradient">{fcfa(m.amount)}</p>
            </div>
            {err && <Alert className="mt-5 text-left">{err}</Alert>}
            <div className="mt-6 grid gap-3">
              <Button size="lg" onClick={online} loading={busy === 'online'} disabled={!!busy} icon={<CreditCard className="h-4 w-4" />}>Payer en ligne</Button>
              <Button size="lg" variant="outline" onClick={cash} loading={busy === 'cash'} disabled={!!busy} icon={<Banknote className="h-4 w-4" />}>Je paie en espèces au studio</Button>
            </div>
          </>
        ) : m?.status === 'en_attente_validation' ? (
          <div className="mt-6 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-6">
            <Banknote className="mx-auto h-10 w-10 text-sky-300" />
            <p className="mt-3 font-semibold">Paiement en espèces annoncé</p>
            <p className="mt-1 text-sm text-bone-200">Réglez {fcfa(m.amount)} au studio : l’équipe confirmera la réception.</p>
          </div>
        ) : allPaid ? (
          <div className="mt-6 rounded-2xl border border-sage/30 bg-sage/10 p-6">
            <CheckCircle2 className="mx-auto h-10 w-10 text-sage" />
            <p className="mt-3 font-semibold">Commande entièrement réglée, merci !</p>
          </div>
        ) : (
          <Alert tone="info" className="mt-6">Aucun paiement n’est demandé pour le moment. Le studio vous préviendra à la prochaine étape.</Alert>
        )}
        {(data.milestones || []).length > 1 && (
          <div className="mt-8 text-left">
            <OrderSteps compact milestones={(data.milestones || []).map((x, i) => ({ ...x, id: i, position: i + 1, kind: 'acompte', deliverable_note: null, requested_at: null, paid_at: null } as Milestone))} />
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="eyebrow">Avant votre session</p>
      <h1 className="mt-3 text-2xl font-semibold">Bonjour {data.first_name}</h1>
      <p className="mt-2 text-bone-400">{data.service_name}{data.start_at ? ` · ${fDate(data.start_at)} · ${fRange(data.start_at, data.end_at)}` : ''}</p>

      {data.payment_status === 'paye' ? (
        <div className="mt-8 rounded-2xl border border-sage/30 bg-sage/10 p-6">
          <CheckCircle2 className="mx-auto h-10 w-10 text-sage" />
          <p className="mt-3 font-semibold">Paiement confirmé</p>
          <p className="mt-1 text-sm text-bone-200">Votre session est autorisée à commencer. Bonne session !</p>
        </div>
      ) : data.payment_status === 'en_attente_validation' ? (
        <div className="mt-8 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-6">
          <Banknote className="mx-auto h-10 w-10 text-sky-300" />
          <p className="mt-3 font-semibold">Paiement en espèces en attente de validation</p>
          <p className="mt-1 text-sm text-bone-200">Réglez {fcfa(data.amount_due)} au studio : l’équipe confirmera la réception avant le début de la session.</p>
        </div>
      ) : data.statut !== 'confirmee' ? (
        <Alert className="mt-8">Cette réservation n’est plus active.</Alert>
      ) : (
        <>
          <div className="mt-8 rounded-2xl border border-ink-600 bg-ink-900 p-6">
            <p className="text-xs uppercase tracking-wider text-bone-600">Montant restant à payer</p>
            <p className="mt-1 font-display text-4xl font-semibold text-gradient">{fcfa(data.amount_due)}</p>
          </div>
          {err && <Alert className="mt-5 text-left">{err}</Alert>}
          <div className="mt-6 grid gap-3">
            <Button size="lg" onClick={online} loading={busy === 'online'} disabled={!!busy} icon={<CreditCard className="h-4 w-4" />}>Payer en ligne</Button>
            <Button size="lg" variant="outline" onClick={cash} loading={busy === 'cash'} disabled={!!busy} icon={<Banknote className="h-4 w-4" />}>Je paie en espèces au studio</Button>
          </div>
          <p className="mt-5 text-xs text-bone-600">La session commence dès la confirmation du paiement.</p>
        </>
      )}
    </Shell>
  );
};

// ------------------------------------------------------------------ Confirmation de présence (rappel 2 h avant)
export const PresenceAction: React.FC = () => {
  useDocumentTitle('Confirmer ma présence');
  const { token } = useParams();
  const { data, setData, error } = useAction(token);
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const answer = async (a: 'confirm' | 'reschedule') => {
    setBusy(a); setErr(null);
    try { setData((await api<{ reservation: ActionSummary }>(`/actions/${token}/presence`, { method: 'POST', body: { answer: a }, auth: false })).reservation); }
    catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  };

  if (error) return <Shell><XCircle className="mx-auto h-12 w-12 text-[#F07A7A]" /><p className="mt-4">{error}</p></Shell>;
  if (!data) return <Shell><Spinner /></Shell>;
  const rescheduleLink = `/mon-espace/reservations?reporter=${data.id}`;

  return (
    <Shell>
      <p className="eyebrow">Votre session</p>
      <h1 className="mt-3 text-2xl font-semibold">Bonjour {data.first_name}</h1>
      <p className="mt-2 text-bone-200">{data.service_name}</p>
      {data.start_at && <p className="text-sm text-bone-400">{fDate(data.start_at)} · {fRange(data.start_at, data.end_at)}</p>}
      {err && <Alert className="mt-5 text-left">{err}</Alert>}

      {data.statut !== 'confirmee' ? (
        <Alert className="mt-8">Cette réservation n’est plus active.</Alert>
      ) : data.presence_status === 'confirmee' ? (
        <div className="mt-8 rounded-2xl border border-sage/30 bg-sage/10 p-6">
          <CalendarCheck2 className="mx-auto h-10 w-10 text-sage" />
          <p className="mt-3 font-semibold">Présence confirmée, merci !</p>
          <p className="mt-1 text-sm text-bone-200">À tout à l’heure au studio.</p>
        </div>
      ) : data.presence_status === 'report_souhaite' ? (
        <div className="mt-8 space-y-4">
          {data.can_reschedule_online ? (
            <>
              <p className="text-sm text-bone-200">Choisissez un nouveau créneau depuis votre espace client.</p>
              <Button size="lg" className="w-full" to={user ? rescheduleLink : `/connexion?redirect=${encodeURIComponent(rescheduleLink)}`} icon={<CalendarClock className="h-4 w-4" />}>Choisir un autre créneau</Button>
            </>
          ) : (
            <Alert tone="warning">Le report en ligne n’est plus possible à moins de {Math.round(data.reschedule_limit_minutes / 60)} h de la session. L’équipe a été prévenue et va vous recontacter.</Alert>
          )}
        </div>
      ) : (
        <>
          <p className="mt-8 text-bone-200">Êtes-vous toujours disponible pour cette session ?</p>
          <div className="mt-5 grid gap-3">
            <Button size="lg" onClick={() => answer('confirm')} loading={busy === 'confirm'} disabled={!!busy} icon={<CheckCircle2 className="h-4 w-4" />}>Confirmer ma présence</Button>
            <Button size="lg" variant="outline" onClick={() => answer('reschedule')} loading={busy === 'reschedule'} disabled={!!busy} icon={<CalendarClock className="h-4 w-4" />}>Je souhaite reporter ma session</Button>
          </div>
        </>
      )}
    </Shell>
  );
};

export const NotFound: React.FC = () => {
  useDocumentTitle('Page introuvable');
  return (
    <Shell>
      <p className="font-display text-7xl font-bold text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Cette page n’existe pas</h1>
      <p className="mt-2 text-bone-400">Le lien est peut-être erroné ou la page a été déplacée.</p>
      <div className="mt-8"><Link to="/" className="inline-flex h-12 items-center rounded-full bg-bone px-6 font-semibold text-ink">Retour à l’accueil</Link></div>
    </Shell>
  );
};
