// Calendrier de réservation de l'ancienne version (textes, couleurs et disposition d'origine).
// Seule la source des créneaux change : disponibilités réelles de l'API, heure par heure.
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { DaySummary, Slot } from '../lib/types';
import { parseSql } from '../lib/format';

interface Props {
  serviceId: number;
  minHours: number;
  maxHours: number;
  price: number;
  start: string | null; // "YYYY-MM-DD HH:MM:SS"
  hours: number;
  onChange: (start: string | null, hours: number) => void;
  reloadKey?: string | number;
}

const hourOf = (s: string) => Number(s.slice(11, 13));
const hh = (n: number) => `${String(n % 24).padStart(2, '0')}h00`;
const slotTime = (s: string) => `${hh(hourOf(s))} - ${hh(hourOf(s) + 1)}`;

export const HourCalendar: React.FC<Props> = ({ serviceId, minHours, maxHours, price, start, hours, onChange, reloadKey }) => {
  const [days, setDays] = useState<DaySummary[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(start ? start.slice(0, 10) : '');
  const [timeSlots, setTimeSlots] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 14 prochains jours d'ouverture (comme l'ancien calendrier, dimanches exclus par les horaires du studio)
  useEffect(() => {
    let off = false;
    api<{ days: DaySummary[] }>(`/public/availability/days?service_id=${serviceId}&hours=1`, { auth: false })
      .then((r) => { if (!off) setDays(r.days.filter((d) => d.open).slice(0, 14)); })
      .catch((e) => !off && setError(e.message));
    return () => { off = true; };
  }, [serviceId, reloadKey]);

  useEffect(() => {
    if (!selectedDate) { setTimeSlots(null); return; }
    let off = false;
    setTimeSlots(null);
    api<{ slots: Slot[] }>(`/public/availability/slots?service_id=${serviceId}&hours=1&date=${selectedDate}`, { auth: false })
      .then((r) => { if (!off) setTimeSlots(r.slots); })
      .catch((e) => !off && setError(e.message));
    return () => { off = true; };
  }, [serviceId, selectedDate, reloadKey]);

  const dates = (days || []).map((d) => {
    const dt = parseSql(d.date)!;
    return {
      date: d.date,
      day: dt.getUTCDate(),
      month: dt.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }),
      weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' })
    };
  });

  // Créneaux sélectionnés = début + durée (conservés dans l'URL de la page)
  const selectedSlots = useMemo(() => {
    if (!start || !timeSlots || start.slice(0, 10) !== selectedDate) return [] as string[];
    const i = timeSlots.findIndex((s) => s.start === start);
    return i < 0 ? [] : timeSlots.slice(i, i + hours).map((s) => s.start);
  }, [start, hours, selectedDate, timeSlots]);

  const handleSlotSelection = (slotId: string) => {
    if (!timeSlots) return;
    const index = (id: string) => timeSlots.findIndex((s) => s.start === id);
    let newSlots: string[];
    if (selectedSlots.includes(slotId)) {
      // Désélectionner le créneau
      newSlots = selectedSlots.filter((id) => id !== slotId);
    } else {
      // Ajouter le créneau
      newSlots = [...selectedSlots, slotId].sort((a, b) => index(a) - index(b));
    }
    // Vérifier que les créneaux sont consécutifs
    if (newSlots.length > 1) {
      const slotIndices = newSlots.map(index);
      const isConsecutive = slotIndices.every((idx, i) =>
        i === 0 || (idx === slotIndices[i - 1] + 1 && hourOf(newSlots[i]) === (hourOf(newSlots[i - 1]) + 1) % 24));
      // Si pas consécutifs, remplacer par le nouveau créneau seulement
      if (!isConsecutive) newSlots = [slotId];
    }
    if (newSlots.length > maxHours) newSlots = newSlots.slice(0, maxHours);
    onChange(newSlots[0] || null, Math.max(1, newSlots.length));
  };

  const getSelectedSlotsText = () => {
    if (selectedSlots.length === 0) return '';
    if (selectedSlots.length === 1) return slotTime(selectedSlots[0]);
    return `${hh(hourOf(selectedSlots[0]))} - ${hh(hourOf(selectedSlots[selectedSlots.length - 1]) + 1)}`;
  };

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="space-y-8">
      {/* Date Selection */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-orange-400" />
          Sélectionner une date
        </h3>
        {!days ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => (
              <button
                key={date.date}
                type="button"
                onClick={() => { setSelectedDate(date.date); if (start?.slice(0, 10) !== date.date) onChange(null, 1); }}
                className={`p-3 max-sm:px-0.5 rounded-lg text-center transition-all duration-300 ${
                  selectedDate === date.date
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <div className="text-xs text-gray-400">{date.weekday}</div>
                <div className="font-semibold">{date.day}</div>
                <div className="text-xs">{date.month}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-400" />
            Créneaux disponibles (sélection multiple possible)
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Cliquez sur plusieurs créneaux consécutifs pour réserver plusieurs heures
          </p>
          {!timeSlots ? (
            <p className="text-sm text-gray-400">Chargement…</p>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot) => {
                const status = slot.available ? 'available' : 'booked';
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => (status === 'available' || selectedSlots.includes(slot.start)) && handleSlotSelection(slot.start)}
                    disabled={status !== 'available' && !selectedSlots.includes(slot.start)}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                      selectedSlots.includes(slot.start)
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                        : status === 'available'
                          ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                          : 'bg-red-900/30 text-red-400 cursor-not-allowed border border-red-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{slotTime(slot.start)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedSlots.includes(slot.start)
                          ? 'bg-orange-500/20 text-orange-300'
                          : status === 'available'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}>
                        {selectedSlots.includes(slot.start)
                          ? 'Sélectionné'
                          : status === 'available'
                            ? 'Disponible'
                            : 'Réservé'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedSlots.length > 0 && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Créneaux sélectionnés</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Horaire: {getSelectedSlotsText()}</div>
            <div>Durée: {selectedSlots.length} heure(s)</div>
            <div className="text-orange-400 font-semibold">
              Total: {(selectedSlots.length * price).toLocaleString()} FCFA
            </div>
            {selectedSlots.length < minHours && <div className="text-yellow-400">Minimum {minHours} heure(s) pour ce service.</div>}
          </div>
        </div>
      )}
    </div>
  );
};
