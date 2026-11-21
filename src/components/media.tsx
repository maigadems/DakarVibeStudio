// Composants visuels : image adaptative (aucun recadrage brutal) et logo animé (absence d'image).
import React, { useLayoutEffect, useRef, useState } from 'react';
import { mediaUrl } from '../lib/api';
import { cx } from '../lib/format';

/**
 * Image qui s'adapte à son cadre :
 *  - pendant le chargement : reflet animé ;
 *  - si le format de la photo est proche de celui du cadre : remplissage (cover) ;
 *  - sinon (ex. photo portrait dans un cadre paysage) : photo entière sur un fond flouté
 *    de la même image, pour ne jamais couper le sujet.
 * Le conteneur parent fixe la taille (aspect-ratio, hauteur de grille…).
 */
export const SmartImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fit?: 'auto' | 'cover' | 'contain';
  eager?: boolean;
}> = ({ src, alt, className, imgClassName, fit = 'auto', eager }) => {
  const box = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<'cover' | 'contain'>(fit === 'contain' ? 'contain' : 'cover');
  const url = mediaUrl(src);

  useLayoutEffect(() => { setLoaded(false); setFailed(false); }, [url]);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (fit === 'auto' && box.current && img.naturalWidth && img.naturalHeight) {
      const r = box.current.getBoundingClientRect();
      const frame = r.width / Math.max(r.height, 1);
      const ratio = img.naturalWidth / img.naturalHeight;
      // Écart de format important (> ~40 %) : on affiche la photo entière
      setMode(Math.abs(Math.log(ratio / frame)) > 0.34 ? 'contain' : 'cover');
    }
    setLoaded(true);
  };

  // Le parent peut positionner l'image en absolu : on n'impose « relative » que sinon
  const position = /(^|\s)(absolute|fixed)(\s|$)/.test(className || '') ? '' : 'relative';
  if (failed) return <div className={cx(position, 'overflow-hidden', className)}><LogoArt variant="float" compact /></div>;

  return (
    <div ref={box} className={cx(position, 'overflow-hidden bg-ink-800', className)}>
      {!loaded && <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,#141416_30%,#222226_50%,#141416_70%)] bg-[length:200%_100%]" aria-hidden />}
      {mode === 'contain' && (
        <img src={url} alt="" aria-hidden loading={eager ? 'eager' : 'lazy'}
          className={cx('absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-[.45] saturate-150 transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0')} />
      )}
      <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={onLoad} onError={() => setFailed(true)}
        className={cx('absolute inset-0 h-full w-full transition-[opacity,transform,filter] duration-700 ease-out',
          mode === 'contain' ? 'object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,.6)]' : 'object-cover',
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.03] opacity-0 blur-sm', imgClassName)} />
    </div>
  );
};

// ------------------------------------------------------------------ Logo animé
export type LogoVariant = 'orbit' | 'pulse' | 'float' | 'shine' | 'equalizer';
export const LOGO_VARIANTS: LogoVariant[] = ['orbit', 'pulse', 'float', 'shine', 'equalizer'];

const Mark: React.FC<{ className?: string }> = ({ className }) => (
  // Logo sur fond noir : le mode « screen » rend le noir transparent sur les fonds sombres
  <img src="/westaf-studio-480.jpg" alt="" aria-hidden draggable={false} decoding="async" className={cx('pointer-events-none select-none mix-blend-screen [mask-image:radial-gradient(circle,black_48%,transparent_70%)]', className)} />
);

/**
 * Visuel de remplacement aux couleurs du studio, avec 5 animations différentes.
 * compact : version réduite (vignettes).
 */
export const LogoArt: React.FC<{ variant?: LogoVariant; className?: string; compact?: boolean; label?: string }> = ({ variant = 'orbit', className, compact, label }) => {
  const size = compact ? 'w-[46%] max-w-[120px]' : 'w-[42%] max-w-[260px]';
  return (
    <div className={cx('group/logo absolute inset-0 isolate flex items-center justify-center overflow-hidden bg-ink-900', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {/* Fond : halo + trame discrète */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(242,107,33,.22),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(217,58,58,.16),transparent_45%)]" />
      <div className="absolute inset-0 -z-10 opacity-[.07] [background-image:linear-gradient(rgba(243,239,232,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(243,239,232,.6)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />

      {variant === 'orbit' && (
        <div className={cx('relative aspect-square', compact ? 'w-[70%] max-w-[180px]' : 'w-[62%] max-w-[360px]')}>
          <div className="absolute inset-0 animate-spin-slow rounded-full p-[1.5px] [background:conic-gradient(from_0deg,transparent_0%,#F26B21_25%,transparent_45%,#D93A3A_70%,transparent_90%)]">
            <div className="h-full w-full rounded-full bg-ink-900" />
          </div>
          <div className="absolute inset-[12%] animate-spin-slower rounded-full border border-dashed border-ember/25" />
          <div className="absolute inset-0 animate-spin-slow">
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_16px_4px_rgba(242,107,33,.7)]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center"><Mark className="w-[78%] animate-breathe" /></div>
        </div>
      )}

      {variant === 'pulse' && (
        <div className={cx('relative flex aspect-square items-center justify-center', compact ? 'w-[60%] max-w-[160px]' : 'w-[50%] max-w-[300px]')}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute inset-0 animate-ring rounded-full border-2 border-ember/60" style={{ animationDelay: `${i}s` }} />
          ))}
          <span className="absolute inset-[18%] animate-glow rounded-full bg-ember/20 blur-2xl" />
          <Mark className="relative w-[82%]" />
        </div>
      )}

      {variant === 'float' && (
        <div className={cx('relative', size)}>
          <span className="absolute inset-x-[10%] -bottom-6 h-4 animate-glow rounded-[50%] bg-black/70 blur-md" />
          <span className="absolute inset-0 animate-glow rounded-full bg-gradient-to-br from-ember/40 to-crimson/30 blur-3xl" />
          <Mark className="relative w-full animate-float" />
        </div>
      )}

      {variant === 'shine' && (
        <div className={cx('relative overflow-hidden', size)}>
          <Mark className="w-full transition duration-700 group-hover/logo:scale-105" />
          <span className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-overlay" />
        </div>
      )}

      {variant === 'equalizer' && (
        <div className={cx('relative flex flex-col items-center', compact ? 'w-[60%]' : 'w-[48%] max-w-[280px]')}>
          <Mark className="w-[80%] animate-breathe" />
          <div className={cx('mt-2 flex w-full items-end justify-center gap-[3px]', compact ? 'h-6' : 'h-12')}>
            {Array.from({ length: compact ? 14 : 22 }, (_, i) => (
              <span key={i} className="w-[3px] origin-bottom animate-eq rounded-full bg-gradient-to-t from-crimson to-ember"
                style={{ height: `${35 + ((i * 37) % 65)}%`, animationDelay: `${(i % 7) * 0.12}s`, animationDuration: `${0.9 + (i % 4) * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Variante choisie de façon stable selon un index (pour alterner les animations)
export const logoVariantFor = (i: number): LogoVariant => LOGO_VARIANTS[Math.abs(i) % LOGO_VARIANTS.length];
