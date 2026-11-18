// Onglet « Factures » : espace client (ses factures) et administration (toutes les factures).
// Une liste simple : chaque facture se consulte ou se télécharge en PDF en un clic.
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, FileText, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDebounced, useDocumentTitle } from '../../lib/hooks';
import { cx, fDateNum, fDateShort, fcfa } from '../../lib/format';
import { Badge, Button, Empty, ErrorState, Input, PageHeader, Spinner, Tabs } from '../../components/ui';
import { DownloadInvoiceButton, INVOICE_STATUS, InvoiceDocument, type Invoice, type InvoiceRow } from '../../components/InvoiceDocument';

type Scope = 'client' | 'admin';
const base = (scope: Scope) => (scope === 'admin' ? '/admin/factures' : '/mon-espace/factures');
const apiBase = (scope: Scope) => (scope === 'admin' ? '/admin/invoices' : '/client/invoices');

export const InvoiceList: React.FC<{ scope: Scope }> = ({ scope }) => {
  useDocumentTitle('Factures');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const q = useDebounced(search);
  const { data, loading, error, reload } = useAsync(() => api<{ invoices: InvoiceRow[] }>(apiBase(scope)).then((r) => r.invoices), [scope]);

  const all = data || [];
  const needle = q.trim().toLowerCase();
  const list = all.filter((i) => (!status || i.status === status) &&
    (!needle || [i.number, i.client_name, i.client_email, i.service_name].some((v) => String(v || '').toLowerCase().includes(needle))));
  const due = list.reduce((s, i) => s + (i.status === 'annulee' ? 0 : i.due), 0);
  const count = (s: string) => all.filter((i) => i.status === s).length;

  return (
    <div>
      <PageHeader eyebrow={scope === 'client' ? 'Mon espace' : undefined} title="Factures"
        subtitle={scope === 'client' ? 'Vos factures sont créées automatiquement après chaque paiement. Téléchargez-les en PDF à tout moment.' : 'Créées automatiquement à chaque encaissement. Cliquez sur « Télécharger » pour obtenir le PDF.'} />

      {all.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={status} onChange={setStatus} tabs={[
            { id: '', label: `Toutes (${all.length})` },
            { id: 'payee', label: `Payées (${count('payee')})` },
            { id: 'partielle', label: `À solder (${count('partielle')})` },
            ...(count('annulee') ? [{ id: 'annulee', label: `Annulées (${count('annulee')})` }] : [])
          ]} />
          {(scope === 'admin' || all.length > 5) && (
            <div className="relative lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-600" />
              <Input className="pl-11" placeholder={scope === 'admin' ? 'N°, client, prestation…' : 'N° ou prestation…'} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        </div>
      )}

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && all.length === 0 && (
        <Empty icon={<FileText className="h-8 w-8" />} title="Aucune facture pour l’instant"
          text={scope === 'client' ? 'Votre première facture apparaîtra ici dès votre premier paiement.' : 'Les factures sont créées automatiquement au premier encaissement d’une réservation.'} />
      )}
      {data && all.length > 0 && list.length === 0 && <Empty title="Aucun résultat" text="Modifiez la recherche ou le filtre." />}

      {list.length > 0 && (
        <>
          <ul className="space-y-3">
            {list.map((i) => (
              <li key={i.id}>
                <div role="link" tabIndex={0} onClick={() => navigate(`${base(scope)}/${i.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`${base(scope)}/${i.id}`)}
                  className="card group flex cursor-pointer flex-col gap-4 p-4 transition hover:border-ember/40 sm:flex-row sm:items-center sm:p-5">
                  <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ember/10 text-ember sm:flex"><FileText className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-semibold">{i.number}</p>
                      <Badge tone={INVOICE_STATUS[i.status].tone}>{INVOICE_STATUS[i.status].label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-bone-400">
                      {scope === 'admin' && <span className="text-bone-200">{i.client_name} · </span>}
                      {i.service_name}{i.start_at ? ` · ${fDateShort(i.start_at)}` : ''} · émise le {fDateNum(i.issued_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="font-display font-semibold tabular-nums">{fcfa(i.total)}</p>
                      <p className={cx('text-xs tabular-nums', i.due > 0 && i.status !== 'annulee' ? 'text-amberish' : 'text-bone-600')}>
                        {i.status === 'annulee' ? `Réglé ${fcfa(i.paid)}` : i.due > 0 ? `Reste ${fcfa(i.due)}` : 'Soldée'}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" icon={<Eye className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); navigate(`${base(scope)}/${i.id}`); }} aria-label={`Voir la facture ${i.number}`}>
                        <span className="hidden sm:inline">Voir</span>
                      </Button>
                      <DownloadInvoiceButton scope={scope} id={i.id} number={i.number} variant="subtle" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {scope === 'admin' && (
            <p className="mt-4 text-right text-xs text-bone-600">{list.length} facture(s) · total {fcfa(list.reduce((s, i) => s + (i.status === 'annulee' ? 0 : i.total), 0))} · reste à encaisser {fcfa(due)}</p>
          )}
        </>
      )}
    </div>
  );
};

export const InvoiceView: React.FC<{ scope: Scope }> = ({ scope }) => {
  const { id } = useParams();
  const { data, loading, error, reload } = useAsync(() => api<{ invoice: Invoice }>(`${apiBase(scope)}/${id}`).then((r) => r.invoice), [id]);
  useDocumentTitle(data ? `Facture ${data.number}` : 'Facture');
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorState message={error || 'Facture introuvable'} onRetry={reload} />;
  return <InvoiceDocument invoice={data} backTo={base(scope)} scope={scope} />;
};

