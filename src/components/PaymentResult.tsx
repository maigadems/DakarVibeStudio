import React from 'react';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';

export const PENDING_PAYMENT_KEY = 'westaf_pending_payment';

interface Props {
  status: 'success' | 'cancel';
  reference: string | null;
  onClose: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  horaire: 'Réservation horaire',
  mixage: 'Mixage de titre',
  mastering: 'Mastering'
};

const readPending = (reference: string | null) => {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_PAYMENT_KEY) || 'null');
    // Le récapitulatif n'est affiché que s'il correspond à la commande du retour PayTech
    return pending && pending.ref && pending.ref === reference ? pending : null;
  } catch {
    return null;
  }
};

const fmt = (n: number) => Number(n).toLocaleString('fr-FR');

const buildWhatsAppMessage = (pending: any, reference: string | null) => {
  const r = pending?.reservationData;
  if (!r) {
    return `Bonjour, je viens d'effectuer le paiement de ma réservation.${reference ? ` Réf : ${reference}` : ''}`;
  }
  const lines = [
    'Bonjour, je confirme ma réservation au studio Westaf Records :',
    '',
    `Nom : ${r.nom}`,
    `Téléphone : ${r.telephone}`,
    `Service : ${SERVICE_LABELS[r.type_service] || r.type_service}`
  ];
  if (r.type_service === 'horaire') {
    lines.push(`Date : ${r.selectedDateFormatted}`);
    lines.push(`Créneau : ${r.selectedSlotsText}`);
    lines.push(`Durée : ${r.duree_heures} heure(s)`);
  } else {
    lines.push(`Nombre de titres : ${r.nombreTitres ?? r.nombre_titres}`);
  }
  lines.push(`Montant total : ${fmt(r.montant_total)} FCFA`);
  lines.push(`Montant payé : ${fmt(pending.amount)} FCFA`);
  if (r.type_service === 'horaire' && r.paymentOption === 'half') {
    lines.push(`Reste à payer au studio : ${fmt(r.montant_total - pending.amount)} FCFA`);
  }
  if (reference) lines.push(`Référence : ${reference}`);
  return lines.join('\n');
};

const PaymentResult: React.FC<Props> = ({ status, reference, onClose }) => {
  const isSuccess = status === 'success';
  const pending = React.useMemo(() => readPending(reference), [reference]);
  const r = pending?.reservationData;

  const openWhatsApp = () => {
    const url = `https://wa.me/221778600482?text=${encodeURIComponent(buildWhatsAppMessage(pending, reference))}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center my-8">
        {isSuccess ? (
          <CheckCircle className="mx-auto mb-4 text-green-400" size={56} />
        ) : (
          <XCircle className="mx-auto mb-4 text-red-400" size={56} />
        )}
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-400' : ''}`}>
          {isSuccess ? 'Réservation confirmée !' : 'Paiement annulé'}
        </h2>
        <p className="text-gray-300 mb-4">
          {isSuccess
            ? 'Merci pour votre paiement. Votre réservation est enregistrée dès que PayTech nous confirme le paiement.'
            : "Le paiement n'a pas abouti. Aucune réservation n'a été créée."}
        </p>

        {isSuccess && r && (
          <div className="text-left text-sm text-gray-300 bg-gray-900/60 rounded-lg p-4 mb-4 space-y-1">
            <div><strong>Nom :</strong> {r.nom}</div>
            <div><strong>Service :</strong> {SERVICE_LABELS[r.type_service] || r.type_service}</div>
            {r.type_service === 'horaire' ? (
              <>
                <div><strong>Date :</strong> {r.selectedDateFormatted}</div>
                <div><strong>Créneau :</strong> {r.selectedSlotsText}</div>
              </>
            ) : (
              <div><strong>Titres :</strong> {r.nombreTitres ?? r.nombre_titres}</div>
            )}
            <div><strong>Montant payé :</strong> {fmt(pending.amount)} FCFA</div>
            {r.type_service === 'horaire' && r.paymentOption === 'half' && (
              <div><strong>Reste à payer au studio :</strong> {fmt(r.montant_total - pending.amount)} FCFA</div>
            )}
          </div>
        )}
        {isSuccess && reference && <p className="text-xs text-gray-400 mb-4">Référence : {reference}</p>}

        <div className="flex flex-col gap-3">
          {isSuccess && (
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg py-3"
            >
              <MessageCircle size={18} /> Confirmer par WhatsApp
            </button>
          )}
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 rounded-lg py-3">
            Retour au site
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
