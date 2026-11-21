// Suivi d'une commande payée par étapes (acompte → premiers livrables → livraison finale)
import React from 'react';
import { Check, Clock, Banknote, Hourglass } from 'lucide-react';
import { cx, fDateNum, fcfa } from '../lib/format';
import type { Milestone } from '../lib/types';

// Rend cliquables les liens présents dans la note des livrables
export const Linkify: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <span className={className}>
    {text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      /^https?:\/\//.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-ember underline-offset-2 hover:underline">{part}</a>
        : <React.Fragment key={i}>{part}</React.Fragment>
    )}
  </span>
);

const ICON = { paye: Check, demande: Clock, en_attente_validation: Banknote, a_venir: Hourglass };

export const OrderSteps: React.FC<{ milestones: Milestone[]; compact?: boolean; actions?: (m: Milestone) => React.ReactNode }> = ({ milestones, compact, actions }) => (
  <ol className="relative space-y-3">
    {milestones.map((m, i) => {
      const I = ICON[m.status] || Hourglass;
      const tone = m.status === 'paye' ? 'bg-sage text-ink' : m.status === 'demande' ? 'bg-amberish text-ink' : m.status === 'en_attente_validation' ? 'bg-sky-400 text-ink' : 'bg-ink-600 text-bone-400';
      return (
        <li key={m.id} className="relative flex gap-3">
          {i < milestones.length - 1 && <span className={cx('absolute left-[13px] top-8 h-[calc(100%-12px)] w-px', m.status === 'paye' ? 'bg-sage/50' : 'bg-ink-600')} />}
          <span className={cx('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', tone)}><I className="h-3.5 w-3.5" /></span>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-semibold">{m.label} <span className="font-normal text-bone-600">· {m.percent} %</span></p>
              <p className="font-display font-semibold tabular-nums">{fcfa(m.amount)}</p>
            </div>
            <p className="text-xs text-bone-400">
              {m.status === 'paye' ? `Réglée${m.paid_at ? ` le ${fDateNum(m.paid_at)}` : ''}`
                : m.status === 'demande' ? 'Paiement demandé'
                  : m.status === 'en_attente_validation' ? 'Espèces annoncées — en attente de validation par le studio'
                    : 'À venir'}
            </p>
            {!compact && m.deliverable_note && (
              <p className="mt-1.5 rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-bone-200"><Linkify text={m.deliverable_note} /></p>
            )}
            {actions && <div className="mt-2">{actions(m)}</div>}
          </div>
        </li>
      );
    })}
  </ol>
);
