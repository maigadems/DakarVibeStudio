import React from 'react';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';

export const PENDING_PAYMENT_KEY = 'westaf_pending_payment';

interface Props {
  status: 'success' | 'cancel';
  reference: string | null;
  onClose: () => void;
}

const PaymentResult: React.FC<Props> = ({ status, reference, onClose }) => {
  const isSuccess = status === 'success';

  const openWhatsApp = () => {
    let message = 'Bonjour, je viens de effectuer un paiement pour ma réservation.';
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_PAYMENT_KEY) || 'null');
      if (pending) {
        message = `Bonjour, je confirme ma reservation pour le ${pending.date}. Montant paye : ${pending.amount} XOF. Nom : ${pending.name}`;
      }
    } catch {
      /* message par défaut */
    }
    if (reference) message += ` (Ref : ${reference})`;
    window.open(`https://wa.me/221710162323?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <CheckCircle className="mx-auto mb-4 text-green-400" size={56} />
        ) : (
          <XCircle className="mx-auto mb-4 text-red-400" size={56} />
        )}
        <h2 className="text-2xl font-bold mb-2">
          {isSuccess ? 'Paiement reçu, merci !' : 'Paiement annulé'}
        </h2>
        <p className="text-gray-300 mb-4">
          {isSuccess
            ? 'Votre réservation est enregistrée dès que PayTech confirme le paiement. Vous pouvez aussi nous écrire sur WhatsApp.'
            : "Le paiement n'a pas abouti. Aucune réservation n'a été créée."}
        </p>
        {isSuccess && reference && (
          <p className="text-sm text-gray-400 mb-4">Référence : {reference}</p>
        )}
        <div className="flex flex-col gap-3">
          {isSuccess && (
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg py-3"
            >
              <MessageCircle size={18} /> Confirmer sur WhatsApp
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
