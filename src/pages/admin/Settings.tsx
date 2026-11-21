import React, { useEffect, useState } from 'react';
import { CheckCircle2, CircleSlash, MessageCircle, Plus, Save, Send, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { fAgo, fDateTime, phoneDisplay, studioToday, weekdayFr } from '../../lib/format';
import type { OpeningDay } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Empty, ErrorState, Field, Input, PageHeader, Select, Spinner, Tabs, Toggle } from '../../components/ui';
import { ProfileForm } from '../account/Account';

const HOURS = Array.from({ length: 25 }, (_, h) => `${String(h).padStart(2, '0')}:00`);

// ------------------------------------------------------------------ Horaires & fermetures
export const AdminAvailability: React.FC = () => {
  useDocumentTitle('Horaires & fermetures');
  const toast = useToast();
  const hours = useAsync(() => api<{ hours: OpeningDay[] }>('/admin/hours').then((r) => r.hours), []);
  const closures = useAsync(() => api<{ closures: any[] }>('/admin/closures').then((r) => r.closures), []);
  const [days, setDays] = useState<OpeningDay[]>([]);
  const [busy, setBusy] = useState(false);
  const [c, setC] = useState({ start_at: `${studioToday()}T08:00`, end_at: `${studioToday()}T23:59`, reason: '' });
  const [impacted, setImpacted] = useState<any[] | null>(null);
  useEffect(() => { if (hours.data) setDays([1, 2, 3, 4, 5, 6, 0].map((wd) => hours.data!.find((d) => d.weekday === wd) || { weekday: wd, is_open: false, open_time: '08:00', close_time: '24:00', break_start: null, break_end: null })); }, [hours.data]);
  const upd = (wd: number, patch: Partial<OpeningDay>) => setDays((all) => all.map((d) => (d.weekday === wd ? { ...d, ...patch } : d)));

  const save = async () => {
    setBusy(true);
    try { await api('/admin/hours', { method: 'PUT', body: { hours: days } }); toast('Horaires enregistrés'); hours.reload(); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Horaires & fermetures" subtitle="Ces règles déterminent les créneaux proposés aux clients." />
      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Horaires d’ouverture</h2><Button size="sm" loading={busy} onClick={save} icon={<Save className="h-4 w-4" />}>Enregistrer</Button></div>
        {hours.loading ? <Spinner /> : (
          <div className="divide-y divide-ink-700">
            {days.map((d) => (
              <div key={d.weekday} className="grid items-center gap-3 py-3 sm:grid-cols-12">
                <div className="flex items-center gap-3 sm:col-span-3"><Toggle checked={d.is_open} onChange={(v) => upd(d.weekday, { is_open: v })} /><span className="font-semibold">{weekdayFr[d.weekday]}</span></div>
                {d.is_open ? (
                  <>
                    <div className="flex items-center gap-2 sm:col-span-4">
                      <Select value={d.open_time} onChange={(e) => upd(d.weekday, { open_time: e.target.value })} className="py-2" aria-label="Ouverture">{HOURS.slice(0, 24).map((h) => <option key={h}>{h}</option>)}</Select>
                      <span className="text-bone-600">→</span>
                      <Select value={d.close_time} onChange={(e) => upd(d.weekday, { close_time: e.target.value })} className="py-2" aria-label="Fermeture">{HOURS.slice(1).map((h) => <option key={h} value={h}>{h === '24:00' ? '00:00 (minuit)' : h}</option>)}</Select>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-5">
                      <span className="text-xs text-bone-600">Pause</span>
                      <Select value={d.break_start || ''} onChange={(e) => upd(d.weekday, { break_start: e.target.value || null, break_end: e.target.value ? d.break_end || HOURS[HOURS.indexOf(e.target.value) + 1] : null })} className="py-2" aria-label="Début de pause">
                        <option value="">Aucune</option>{HOURS.slice(0, 24).map((h) => <option key={h}>{h}</option>)}
                      </Select>
                      {d.break_start && <Select value={d.break_end || ''} onChange={(e) => upd(d.weekday, { break_end: e.target.value })} className="py-2" aria-label="Fin de pause">{HOURS.slice(1).map((h) => <option key={h}>{h}</option>)}</Select>}
                    </div>
                  </>
                ) : <p className="text-sm text-bone-600 sm:col-span-9">Fermé</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-1 font-semibold">Fermetures exceptionnelles</h2>
        <p className="mb-5 text-sm text-bone-400">Jours fériés, travaux, événements… Aucun créneau n’est proposé pendant ces périodes.</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Début"><Input type="datetime-local" value={c.start_at} onChange={(e) => setC({ ...c, start_at: e.target.value })} /></Field>
          <Field label="Fin"><Input type="datetime-local" value={c.end_at} onChange={(e) => setC({ ...c, end_at: e.target.value })} /></Field>
          <Field label="Motif"><Input value={c.reason} onChange={(e) => setC({ ...c, reason: e.target.value })} placeholder="Tabaski, maintenance…" /></Field>
          <div className="flex items-end"><Button className="w-full" icon={<Plus className="h-4 w-4" />} onClick={async () => {
            try { const r = await api<{ impacted: any[] }>('/admin/closures', { method: 'POST', body: c }); setImpacted(r.impacted); toast('Fermeture ajoutée'); closures.reload(); } catch (e: any) { toast(e.message, 'error'); }
          }}>Ajouter</Button></div>
        </div>
        {impacted && impacted.length > 0 && (
          <Alert tone="warning" className="mt-4">
            <AlertTriangle className="mr-1 inline h-4 w-4" />{impacted.length} réservation(s) confirmée(s) tombent pendant cette fermeture et n’ont pas été modifiées : {impacted.map((r) => `${r.nom} (${fDateTime(r.start_at)})`).join(', ')}. Reportez-les depuis « Réservations ».
          </Alert>
        )}
        <ul className="mt-5 divide-y divide-ink-700 rounded-2xl border border-ink-600">
          {(closures.data || []).map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>{fDateTime(x.start_at)} → {fDateTime(x.end_at)}{x.reason ? ` · ${x.reason}` : ''}</span>
              <button onClick={async () => { await api(`/admin/closures/${x.id}`, { method: 'DELETE' }); closures.reload(); }} className="text-bone-600 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {closures.data && !closures.data.length && <li className="px-4 py-6 text-center text-sm text-bone-600">Aucune fermeture prévue</li>}
        </ul>
      </section>
    </div>
  );
};

// ------------------------------------------------------------------ Paramètres
interface SettingsData {
  settings: Record<string, string>;
  integrations: { whatsapp: boolean; whatsappWebhook: boolean; paytech: boolean; smtp: boolean; google: boolean; push?: boolean; templates: Record<string, string> };
}

const Status: React.FC<{ ok: boolean; label: string; help: string }> = ({ ok, label, help }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-ink-600 bg-ink-900 p-4">
    {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" /> : <CircleSlash className="mt-0.5 h-5 w-5 shrink-0 text-amberish" />}
    <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-bone-600">{ok ? 'Configuré' : help}</p></div>
  </div>
);

export const AdminSettings: React.FC = () => {
  useDocumentTitle('Paramètres');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api<SettingsData>('/admin/settings'), []);
  const logs = useAsync(() => api<{ messages: any[] }>('/admin/whatsapp/messages?limit=60').then((r) => r.messages), []);
  const [tab, setTab] = useState('whatsapp');
  const [s, setS] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (data) setS({ ...data.settings, whatsapp_admin_number: phoneDisplay(data.settings.whatsapp_admin_number) }); }, [data]);

  const save = async (keys: string[]) => {
    setBusy('save');
    try { await api('/admin/settings', { method: 'PUT', body: Object.fromEntries(keys.map((k) => [k, s[k]])) }); toast('Paramètres enregistrés'); reload(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(null); }
  };
  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <Field label={label} hint={hint}><Input value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} {...props} /></Field>
  );

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorState message={error || 'Erreur'} onRetry={reload} />;
  const i = data.integrations;

  return (
    <div>
      <PageHeader title="Paramètres" />
      <div className="mb-6"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'whatsapp', label: 'WhatsApp' }, { id: 'booking', label: 'Réservations' }, { id: 'studio', label: 'Studio & contact' }, { id: 'invoices', label: 'Facturation' }, { id: 'integrations', label: 'Intégrations' }, { id: 'account', label: 'Mon compte' }]} /></div>

      {tab === 'whatsapp' && (
        <div className="space-y-6">
          {!i.whatsapp && <Alert tone="warning">L’API WhatsApp Cloud n’est pas encore configurée sur le serveur : les messages sont journalisés comme « non configuré » et aucun n’est envoyé. Voir l’onglet Intégrations.</Alert>}
          <section className="card space-y-5 p-5 sm:p-6">
            <h2 className="font-semibold">Notifications de Jeuss</h2>
            {field('whatsapp_admin_number', 'Numéro WhatsApp destinataire', { type: 'tel' }, 'Reçoit les nouvelles réservations, reports, annulations et demandes de paiement en espèces.')}
            <Toggle checked={s.notify_engineer_whatsapp === '1'} onChange={(v) => setS({ ...s, notify_engineer_whatsapp: v ? '1' : '0' })} label="Prévenir aussi l’ingénieur affecté par WhatsApp (sans montants)" />
            <div className="grid gap-4 sm:grid-cols-2">
              {field('reminder_minutes_before', 'Rappel de présence (minutes avant)', { type: 'number', min: 30 }, 'Par défaut 120 min (2 h)')}
              {field('payment_link_minutes_before', 'Lien de paiement du solde (minutes avant)', { type: 'number', min: 1 }, 'Par défaut 10 min')}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button loading={busy === 'save'} icon={<Save className="h-4 w-4" />} onClick={() => save(['whatsapp_admin_number', 'notify_engineer_whatsapp', 'reminder_minutes_before', 'payment_link_minutes_before'])}>Enregistrer</Button>
              <Button variant="subtle" loading={busy === 'test'} icon={<Send className="h-4 w-4" />} onClick={async () => {
                setBusy('test');
                try { await api('/admin/whatsapp/test', { method: 'POST', body: {} }); toast('Message de test envoyé'); }
                catch (e: any) { toast(`Échec : ${e.message}`, 'error'); } finally { setBusy(null); logs.reload(); }
              }}>Envoyer un message de test</Button>
            </div>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-semibold">Journal des messages</h2>
            {logs.loading ? <Spinner /> : !logs.data?.length ? <Empty icon={<MessageCircle className="h-7 w-7" />} title="Aucun message" /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead><tr><th className="table-head">Quand</th><th className="table-head">Type</th><th className="table-head">Numéro</th><th className="table-head">Statut</th></tr></thead>
                  <tbody className="divide-y divide-ink-700">
                    {logs.data.map((m) => (
                      <tr key={m.id}>
                        <td className="table-cell whitespace-nowrap text-bone-400">{fAgo(m.created_at)}</td>
                        <td className="table-cell">{m.direction === 'in' ? '← ' : ''}{m.kind}</td>
                        <td className="table-cell text-bone-400">{phoneDisplay(m.to_phone)}</td>
                        <td className="table-cell"><Badge tone={['sent', 'delivered', 'read', 'received'].includes(m.status) ? 'green' : ['failed', 'not_configured'].includes(m.status) ? 'red' : 'neutral'}>{m.status}</Badge>{m.error && <p className="mt-1 max-w-xs truncate text-xs text-bone-600" title={m.error}>{m.error}</p>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'booking' && (
        <section className="card space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('booking_window_days', 'Réservable jusqu’à (jours à l’avance)', { type: 'number', min: 1 })}
            {field('min_lead_minutes', 'Délai minimum avant une session (minutes)', { type: 'number', min: 0 })}
            {field('reschedule_limit_minutes', 'Report en ligne possible jusqu’à (minutes avant)', { type: 'number', min: 0 }, 'Par défaut 120 min : au-delà, le report en ligne est bloqué')}
            {field('hold_minutes', 'Durée de blocage du créneau pendant le paiement (minutes)', { type: 'number', min: 10 })}
          </div>
          <Toggle checked={s.respect_engineer_unavailability === '1'} onChange={(v) => setS({ ...s, respect_engineer_unavailability: v ? '1' : '0' })} label="Ne pas proposer de créneau quand tous les ingénieurs sont absents" />
          <Button loading={busy === 'save'} icon={<Save className="h-4 w-4" />} onClick={() => save(['booking_window_days', 'min_lead_minutes', 'reschedule_limit_minutes', 'hold_minutes', 'respect_engineer_unavailability'])}>Enregistrer</Button>
        </section>
      )}

      {tab === 'studio' && (
        <section className="card space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('studio_name', 'Nom du studio')}
            {field('address', 'Adresse')}
            {field('contact_phone', 'Téléphone principal', {}, 'Aussi utilisé pour le bouton WhatsApp du formulaire de contact')}
            {field('contact_phone_2', 'Téléphone secondaire')}
            {field('contact_email', 'E-mail principal', { type: 'email' })}
            {field('contact_email_2', 'E-mail secondaire', { type: 'email' })}
            {field('maps_url', 'Lien Google Maps', { type: 'url' }, 'Google Maps → le studio → Partager → Copier le lien')}
            {field('yango_url', 'Lien Yango', { type: 'url' }, 'Application Yango → position du studio → Partager → Copier le lien')}
            {field('instagram_url', 'Instagram', { type: 'url' })}
            {field('snapchat_url', 'Snapchat', { type: 'url' })}
            {field('facebook_url', 'Facebook', { type: 'url' })}
            {field('productions_playlist_url', 'Playlist des productions', { type: 'url' }, 'Lien « Découvrez toutes nos productions » sur l’accueil')}
          </div>
          <Button loading={busy === 'save'} icon={<Save className="h-4 w-4" />} onClick={() => save(['studio_name', 'address', 'contact_phone', 'contact_phone_2', 'contact_email', 'contact_email_2', 'maps_url', 'yango_url', 'instagram_url', 'snapchat_url', 'facebook_url', 'productions_playlist_url'])}>Enregistrer</Button>
        </section>
      )}

      {tab === 'invoices' && (
        <section className="card space-y-5 p-5 sm:p-6">
          <p className="text-sm text-bone-400">Mentions affichées sur toutes les factures. Renseignez vos informations légales réelles (NINEA, RCCM).</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('invoice_company_name', 'Raison sociale')}
            {field('invoice_address', 'Adresse')}
            {field('invoice_ninea', 'NINEA')}
            {field('invoice_rccm', 'RCCM')}
            {field('invoice_prefix', 'Préfixe des numéros', { maxLength: 8 }, 'Ex. WR → WR-2026-0001 (s’applique aux prochaines factures)')}
            {field('invoice_footer', 'Mention de bas de page')}
          </div>
          <Button loading={busy === 'save'} icon={<Save className="h-4 w-4" />} onClick={() => save(['invoice_company_name', 'invoice_address', 'invoice_ninea', 'invoice_rccm', 'invoice_prefix', 'invoice_footer'])}>Enregistrer</Button>
        </section>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <p className="text-sm text-bone-400">Ces services se configurent dans le fichier <code className="rounded bg-ink-700 px-1.5">.env</code> du serveur (les clés ne transitent jamais par le site).</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Status ok={i.paytech} label="PayTech (paiement en ligne)" help="PAYTECH_API_KEY / PAYTECH_API_SECRET manquants" />
            <Status ok={i.whatsapp} label="WhatsApp Cloud API (envoi)" help="WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID manquants" />
            <Status ok={i.whatsappWebhook} label="Webhook WhatsApp (réponses des clients)" help="WHATSAPP_VERIFY_TOKEN / WHATSAPP_APP_SECRET manquants" />
            <Status ok={i.smtp} label="E-mails (mot de passe oublié)" help="SMTP_HOST / SMTP_USER / SMTP_PASSWORD manquants" />
            <Status ok={i.google} label="Connexion Google" help="GOOGLE_CLIENT_ID manquant" />
            <Status ok={!!i.push} label="Notifications push (téléphones)" help="VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY manquants" />
          </div>
          <div className="card p-5 text-sm">
            <p className="mb-2 font-semibold">Modèles WhatsApp attendus (à faire approuver dans Meta)</p>
            <ul className="space-y-1 text-bone-400">{Object.entries(i.templates).map(([k, v]) => <li key={k}><code className="text-bone-200">{v}</code> · {k}</li>)}</ul>
          </div>
        </div>
      )}

      {tab === 'account' && <ProfileForm />}
    </div>
  );
};
