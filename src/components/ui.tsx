import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, X, AlertTriangle, Inbox } from 'lucide-react';
import { cx } from '../lib/format';
import { TONE_CLASS } from '../lib/labels';

// ------------------------------------------------------------------ Bouton
type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-ember to-crimson text-white shadow-lg shadow-ember/20 hover:shadow-ember/40 hover:brightness-110',
  outline: 'border border-bone/20 text-bone hover:border-ember/70 hover:text-white',
  ghost: 'text-bone-200 hover:bg-ink-700 hover:text-bone',
  subtle: 'bg-ink-700 text-bone-200 hover:bg-ink-600 hover:text-bone',
  danger: 'bg-crimson/15 text-[#F07A7A] ring-1 ring-crimson/30 hover:bg-crimson/25'
};
const SIZES = { sm: 'h-9 px-3.5 text-[13px]', md: 'h-11 px-5 text-sm', lg: 'h-14 px-7 text-[15px]' };

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES; loading?: boolean; icon?: React.ReactNode; to?: string };

export const Button: React.FC<BtnProps> = ({ variant = 'primary', size = 'md', loading, icon, className, children, to, disabled, ...rest }) => {
  const cls = cx('inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50', VARIANTS[variant], SIZES[size], className);
  const inner = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button className={cls} disabled={disabled || loading} {...rest}>{inner}</button>;
};

// ------------------------------------------------------------------ Champs
export const Field: React.FC<{ label?: string; hint?: string; error?: string | null; children: React.ReactNode; className?: string; htmlFor?: string }> = ({ label, hint, error, children, className, htmlFor }) => (
  <div className={className}>
    {label && <label className="label" htmlFor={htmlFor}>{label}</label>}
    {children}
    {error ? <p className="mt-1.5 text-xs text-[#F07A7A]">{error}</p> : hint ? <p className="mt-1.5 text-xs text-bone-600">{hint}</p> : null}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cx('input', className)} {...p} />);
Input.displayName = 'Input';

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...p }) => <textarea className={cx('input min-h-[96px] resize-y', className)} {...p} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...p }) => (
  <select className={cx('input appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A39E95' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...p}>
    {children}
  </select>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <label className={cx('inline-flex cursor-pointer items-center gap-3', disabled && 'opacity-50')}>
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-ember' : 'bg-ink-500')}>
      <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
    {label && <span className="text-sm text-bone-200">{label}</span>}
  </label>
);

// ------------------------------------------------------------------ Badges
export const Badge: React.FC<{ tone?: keyof typeof TONE_CLASS; children: React.ReactNode; className?: string }> = ({ tone = 'neutral', children, className }) => (
  <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', TONE_CLASS[tone], className)}>{children}</span>
);

export const StatusBadge: React.FC<{ map: Record<string, { label: string; tone: any }>; value?: string | null }> = ({ map, value }) => {
  if (!value || !map[value]) return null;
  return <Badge tone={map[value].tone}>{map[value].label}</Badge>;
};

// ------------------------------------------------------------------ Modale
export const Modal: React.FC<{ open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; footer?: React.ReactNode }> = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cx('relative flex max-h-[92vh] w-full animate-scale-in flex-col overflow-hidden rounded-t-3xl border border-ink-600 bg-ink-800 shadow-2xl sm:rounded-3xl', w)}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-600/70 px-5 py-4 sm:px-6">
          <div className="min-w-0 font-display text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-full p-1.5 text-bone-400 hover:bg-ink-700 hover:text-bone" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-600/70 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
};

// Fenêtre de confirmation
export const Confirm: React.FC<{ open: boolean; onClose: () => void; onConfirm: () => Promise<void> | void; title: string; message: React.ReactNode; confirmLabel?: string; danger?: boolean; children?: React.ReactNode }> = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', danger, children }) => {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} size="sm" title={<span className="flex items-center gap-2">{danger && <AlertTriangle className="h-5 w-5 text-[#F07A7A]" />}{title}</span>}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={busy}>Annuler</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={async () => {
          setBusy(true);
          try { await onConfirm(); } finally { setBusy(false); }
        }}>{confirmLabel}</Button>
      </>}>
      <div className="text-sm leading-relaxed text-bone-200">{message}</div>
      {children}
    </Modal>
  );
};

// ------------------------------------------------------------------ États
export const Spinner: React.FC<{ className?: string; label?: string }> = ({ className, label }) => (
  <div className={cx('flex items-center justify-center gap-3 py-16 text-bone-400', className)}>
    <span className="flex h-6 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-[3px] origin-bottom animate-wave rounded-full bg-ember" style={{ height: '100%', animationDelay: `${i * 0.12}s` }} />)}
    </span>
    {label && <span className="text-sm">{label}</span>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => <div className={cx('animate-pulse rounded-xl bg-ink-700/70', className)} />;

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
    <AlertTriangle className="h-8 w-8 text-[#F07A7A]" />
    <p className="text-sm text-bone-200">{message}</p>
    {onRetry && <Button variant="subtle" size="sm" onClick={onRetry}>Réessayer</Button>}
  </div>
);

export const Empty: React.FC<{ icon?: React.ReactNode; title: string; text?: React.ReactNode; action?: React.ReactNode }> = ({ icon, title, text, action }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-600 px-6 py-14 text-center">
    <div className="text-bone-600">{icon || <Inbox className="h-8 w-8" />}</div>
    <p className="font-display text-base font-semibold">{title}</p>
    {text && <p className="max-w-md text-sm text-bone-400">{text}</p>}
    {action}
  </div>
);

export const Alert: React.FC<{ tone?: 'error' | 'info' | 'success' | 'warning'; children: React.ReactNode; className?: string }> = ({ tone = 'error', children, className }) => {
  const c = { error: 'border-crimson/30 bg-crimson/10 text-[#F4A3A3]', info: 'border-ember/25 bg-ember/10 text-bone-200', success: 'border-sage/30 bg-sage/10 text-[#B9DCC9]', warning: 'border-amberish/30 bg-amberish/10 text-[#F0CF8F]' }[tone];
  return <div className={cx('rounded-xl border px-4 py-3 text-sm', c, className)} role={tone === 'error' ? 'alert' : undefined}>{children}</div>;
};

// ------------------------------------------------------------------ Mise en page des espaces
export const PageHeader: React.FC<{ title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; eyebrow?: string }> = ({ title, subtitle, actions, eyebrow }) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-bone-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode; accent?: boolean }> = ({ label, value, hint, icon, accent }) => (
  <div className={cx('card relative overflow-hidden p-5', accent && 'border-ember/30')}>
    {accent && <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ember/15 blur-2xl" />}
    <div className="flex items-center justify-between text-bone-400">
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <div className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</div>
    {hint && <div className="mt-1 text-xs text-bone-600">{hint}</div>}
  </div>
);

export const Tabs: React.FC<{ tabs: { id: string; label: React.ReactNode }[]; value: string; onChange: (id: string) => void }> = ({ tabs, value, onChange }) => (
  <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={cx('whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition', value === t.id ? 'bg-bone text-ink' : 'text-bone-400 hover:bg-ink-700 hover:text-bone')}>
        {t.label}
      </button>
    ))}
  </div>
);
