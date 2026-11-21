// Boutons « Itinéraire Google Maps » et « Venir en Yango » (liens réglés par Jeuss dans Paramètres → Studio)
import React from 'react';
import { Car, MapPin } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { cx } from '../lib/format';

export const Directions: React.FC<{ className?: string; compact?: boolean }> = ({ className, compact }) => {
  const { settings } = useConfig();
  const maps = settings.maps_url;
  const yango = settings.yango_url;
  if (!maps && !yango) return null;
  const btn = cx('inline-flex items-center justify-center gap-2 rounded-full font-semibold transition', compact ? 'px-3.5 py-2 text-xs' : 'px-5 py-3 text-sm');
  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {maps && (
        <a href={maps} target="_blank" rel="noopener noreferrer" className={cx(btn, 'border border-ink-600 bg-ink-900 text-bone hover:border-ember/60')}>
          <MapPin className="h-4 w-4 text-ember" /> Itinéraire Google Maps
        </a>
      )}
      {yango && (
        <a href={yango} target="_blank" rel="noopener noreferrer" className={cx(btn, 'bg-[#FC3F1D] text-white hover:bg-[#e2361a]')}>
          <Car className="h-4 w-4" /> Venir en Yango
        </a>
      )}
    </div>
  );
};
