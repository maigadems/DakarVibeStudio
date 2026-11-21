// Facture au format « papier » : affichée à l'écran et imprimable / enregistrable en PDF
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Mail, MessageCircle, Printer, Send, Share2 } from 'lucide-react';
import { api, downloadFile } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { fDateNum, fcfa, phoneDisplay } from '../lib/format';
import { waLink } from '../lib/whatsapp';
import { Badge, Button, Modal } from './ui';

export interface Invoice {
  id: number;
  number: string;
  issued_at: string;
  status: 'payee' | 'partielle' | 'annulee';
  issuer: { name: string; address: string | null; phone: string | null; email: string | null; ninea: string | null; rccm: string | null; footer: string | null };
  client: { name: string; email: string | null; phone: string | null };
  reservation: { id: string; service_name: string; start_at: string | null; end_at: string | null; statut: string };
  lines: { label: string; detail: string | null; quantity: number; unit: string; unit_price: number; total: number }[];
  total: number;
  paid: number;
  due: number;
  payments: { id: number; date: string; amount: number; reference: string; label: string }[];
  share_url?: string;
}

export interface InvoiceRow { id: number; number: string; issued_at: string; client_name: string; client_email: string | null; reservation_id: string; service_name: string; start_at: string | null; total: number; paid: number; due: number; status: Invoice['status'] }

export const INVOICE_STATUS: Record<Invoice['status'], { label: string; tone: 'green' | 'amber' | 'red' }> = {
  payee: { label: 'Payée', tone: 'green' },
  partielle: { label: 'Partiellement payée', tone: 'amber' },
  annulee: { label: 'Réservation annulée', tone: 'red' }
};

const money = (n: number) => fcfa(n).replace('FCFA', 'F CFA');

// Téléchargement du PDF généré par le serveur (client : ses factures ; admin : toutes)
export type InvoiceScope = 'client' | 'admin' | 'public';
const pdfPath = (scope: InvoiceScope, id: number, token?: string) => (scope === 'public' ? `/actions/${token}/invoice/pdf` : `${scope === 'admin' ? '/admin' : '/client'}/invoices/${id}/pdf`);

export const DownloadInvoiceButton: React.FC<{ scope: InvoiceScope; id: number; number: string; token?: string; size?: 'sm' | 'md'; variant?: 'primary' | 'subtle' | 'ghost'; label?: string; className?: string }> = ({ scope, id, number, token, size = 'sm', variant = 'primary', label = 'Télécharger', className }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button size={size} variant={variant} loading={busy} className={className} icon={<Download className="h-4 w-4" />} aria-label={`Télécharger la facture ${number}`}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await downloadFile(pdfPath(scope, id, token), `facture-${number}.pdf`);
          toast(`Facture ${number} téléchargée`);
        } catch (err: any) { toast(err.message, 'error'); } finally { setBusy(false); }
      }}>
      {label}
    </Button>
  );
};

// Envoi / partage de la facture
const RESULT: Record<string, string> = { manual: 'à envoyer à la main', sent: 'envoyée', not_configured: 'non configuré sur le serveur', no_contact: 'aucun contact', failed: 'échec' };

export const SendInvoiceButton: React.FC<{ scope: 'client' | 'admin'; id: number; number: string; shareUrl?: string; clientPhone?: string | null; size?: 'sm' | 'md'; variant?: 'primary' | 'subtle' | 'ghost'; label?: string }> = ({ scope, id, number, shareUrl, clientPhone, size = 'sm', variant = 'ghost', label = 'Envoyer' }) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [channels] = useState({ email: true, whatsapp: false });
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      const r = await api<{ result: Record<string, string> }>(`/${scope === 'admin' ? 'admin' : 'client'}/invoices/${id}/send`, { method: 'POST', body: scope === 'admin' ? channels : {} });
      const parts = Object.entries(r.result).map(([k, v]) => `${k === 'email' ? 'E-mail' : 'WhatsApp'} : ${RESULT[v] || v}`);
      toast(`Facture ${number} — ${parts.join(' · ')}`, Object.values(r.result).every((v) => v === 'sent') ? 'success' : 'info');
      setOpen(false);
    } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  const share = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: `Facture ${number}`, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); toast('Lien de la facture copié'); }
    } catch { /* partage annulé */ }
  };
  return (
    <>
      <Button size={size} variant={variant} icon={<Send className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label={`Envoyer la facture ${number}`}>{label}</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" title={`Envoyer la facture ${number}`}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Fermer</Button><Button loading={busy} disabled={scope === 'admin' && !channels.email} icon={<Send className="h-4 w-4" />} onClick={send}>{scope === 'admin' ? 'Envoyer par e-mail' : 'Recevoir par e-mail'}</Button></>}>
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {scope === 'admin' ? (
            <>
              <p className="flex items-center gap-2 text-sm text-bone-400"><Mail className="h-4 w-4 text-ember" />Par e-mail : la facture est envoyée en PDF joint.</p>
              {shareUrl && waLink(clientPhone, `Bonjour, voici votre facture ${number} Westaf Records : ${shareUrl}`) && (
                <a href={waLink(clientPhone, `Bonjour, voici votre facture ${number} Westaf Records : ${shareUrl}`)!} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white hover:bg-[#1fb458]">
                  <MessageCircle className="h-4 w-4" /> Envoyer par WhatsApp
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-bone-400">Recevez la facture en PDF à l’adresse e-mail de votre compte, ou partagez son lien (comptable, manager…).</p>
          )}
          {shareUrl && (
            <div className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-900 p-2 pl-3">
              <span className="min-w-0 flex-1 truncate text-xs text-bone-400">{shareUrl}</span>
              <Button size="sm" variant="subtle" icon={<Share2 className="h-4 w-4" />} onClick={share}>Partager</Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export const InvoiceDocument: React.FC<{ invoice: Invoice; backTo?: string; scope: InvoiceScope; token?: string }> = ({ invoice: inv, backTo, scope, token }) => (
  <div>
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
      {backTo ? <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone"><ArrowLeft className="h-4 w-4" />Retour aux factures</Link> : <span />}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={INVOICE_STATUS[inv.status].tone}>{INVOICE_STATUS[inv.status].label}</Badge>
        <Button size="sm" variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Imprimer</Button>
        {scope !== 'public' && <SendInvoiceButton scope={scope} id={inv.id} number={inv.number} shareUrl={inv.share_url} clientPhone={inv.client.phone} />}
        <DownloadInvoiceButton scope={scope} id={inv.id} number={inv.number} token={token} label="Télécharger le PDF" />
      </div>
    </div>

    <article className="print-area mx-auto max-w-3xl rounded-2xl bg-white p-6 text-[13px] leading-relaxed text-neutral-800 shadow-2xl sm:p-12">
      <header className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <img src="/logo.jpg" alt="" className="h-14 w-14 rounded-full" />
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-900">{inv.issuer.name}</p>
            {inv.issuer.address && <p>{inv.issuer.address}</p>}
            {inv.issuer.phone && <p>{inv.issuer.phone}</p>}
            {inv.issuer.email && <p>{inv.issuer.email}</p>}
            {inv.issuer.ninea && <p>NINEA : {inv.issuer.ninea}</p>}
            {inv.issuer.rccm && <p>RCCM : {inv.issuer.rccm}</p>}
          </div>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-3xl font-bold text-neutral-900">FACTURE</p>
          <p className="mt-1 font-semibold">N° {inv.number}</p>
          <p>Date : {fDateNum(inv.issued_at)}</p>
          <p className="text-neutral-500">Réf. réservation : {inv.reservation.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </header>

      <section className="grid gap-6 py-8 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Facturé à</p>
          <p className="mt-1 font-semibold text-neutral-900">{inv.client.name}</p>
          {inv.client.email && <p>{inv.client.email}</p>}
          {inv.client.phone && <p>{phoneDisplay(inv.client.phone)}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Statut</p>
          <p className="mt-1 font-semibold text-neutral-900">{INVOICE_STATUS[inv.status].label}</p>
        </div>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-neutral-300 text-left text-[11px] uppercase tracking-wider text-neutral-500">
            <th className="py-2.5 pr-3 font-semibold">Désignation</th>
            <th className="py-2.5 pr-3 text-right font-semibold">Qté</th>
            <th className="hidden py-2.5 pr-3 text-right font-semibold sm:[display:table-cell]">Prix unitaire</th>
            <th className="py-2.5 text-right font-semibold">Montant</th>
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((l, i) => (
            <tr key={i} className="border-b border-neutral-200 align-top">
              <td className="py-3 pr-3"><p className="font-semibold text-neutral-900">{l.label}</p>{l.detail && <p className="text-neutral-500">{l.detail}</p>}</td>
              <td className="py-3 pr-3 text-right tabular-nums">{l.quantity} {l.unit !== 'forfait' ? `${l.unit}${l.quantity > 1 ? 's' : ''}` : ''}</td>
              <td className="hidden py-3 pr-3 text-right tabular-nums sm:[display:table-cell]">{money(l.unit_price)}</td>
              <td className="py-3 text-right font-semibold tabular-nums text-neutral-900">{money(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between"><dt>Total</dt><dd className="font-semibold tabular-nums text-neutral-900">{money(inv.total)}</dd></div>
          <div className="flex justify-between"><dt>Déjà réglé</dt><dd className="tabular-nums">{money(inv.paid)}</dd></div>
          <div className="flex justify-between border-t border-neutral-300 pt-2 text-base"><dt className="font-semibold text-neutral-900">Reste à payer</dt><dd className="font-bold tabular-nums text-neutral-900">{money(inv.due)}</dd></div>
        </dl>
      </div>

      {inv.payments.length > 0 && (
        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Règlements reçus</p>
          <table className="mt-2 w-full">
            <tbody>
              {inv.payments.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{fDateNum(p.date)}</td>
                  <td className="py-2 pr-3">{p.label}{!p.reference.startsWith('LEGACY_') && <span className="hidden text-neutral-400 sm:inline"> · {p.reference}</span>}</td>
                  <td className="whitespace-nowrap py-2 text-right tabular-nums">{money(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
        {inv.issuer.footer && <p>{inv.issuer.footer}</p>}
        <p className="mt-1">Montants en francs CFA (XOF).</p>
      </footer>
    </article>
  </div>
);
