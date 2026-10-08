import React from 'react';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { fetchCredentials } from '../utils/accountService';

export const PENDING_PAYMENT_KEY = 'westaf_pending_payment';

interface Props {
  status: 'success' | 'cancel';
  reference: string | null;
  summary?: any;
  revealKey?: string | null;
  onOpenClientSpace?: () => void;
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
    'Bonjour Westaf Records,',
    'Je confirme ma réservation après paiement :',
    '',
    `👤 Nom : ${r.nom}`,
    `📞 Téléphone : ${r.telephone}`,
    ...(r.email ? [`✉️ Email : ${r.email}`] : []),
    `🎙️ Service choisi : ${SERVICE_LABELS[r.type_service] || r.type_service}`
  ];
  if (r.type_service === 'horaire') {
    lines.push(`📅 Date : ${r.selectedDateFormatted}`);
    lines.push(`🕒 Créneau : ${r.selectedSlotsText}`);
    lines.push(`⏱️ Durée : ${r.duree_heures} heure(s)`);
  } else {
    lines.push(`🎵 Nombre de titres : ${r.nombreTitres ?? r.nombre_titres}`);
  }
  lines.push('');
  lines.push(`💰 Montant total : ${fmt(r.montant_total)} FCFA`);
  lines.push(`✅ Montant payé : ${fmt(pending.amount)} FCFA`);
  if (r.type_service === 'horaire' && r.paymentOption === 'half') {
    lines.push(`Type de paiement : acompte (50 %)`);
    lines.push(`Reste à payer au studio : ${fmt(r.montant_total - pending.amount)} FCFA`);
  } else {
    lines.push('Type de paiement : total');
  }
  if (r.message) lines.push(`📝 Remarques : ${r.message}`);
  if (reference) lines.push(`🔖 Référence : ${reference}`);
  lines.push('', 'Merci !');
  return lines.join('\n');
};

const PaymentResult: React.FC<Props> = ({ status, reference, summary, revealKey, onOpenClientSpace, onClose }) => {
  const isSuccess = status === 'success';
  const [creds, setCreds] = React.useState<{ telephone: string; password: string | null } | 'waiting' | 'none'>('waiting');

  // L'IPN PayTech peut arriver après le retour du client : on réessaie quelques secondes
  React.useEffect(() => {
    if (!isSuccess || !revealKey) {
      setCreds('none');
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      const r = await fetchCredentials(revealKey);
      if (cancelled) return;
      if (r && r !== 'pending') return setCreds(r);
      if (++attempts >= 15) return setCreds('none');
      setTimeout(poll, 2000);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [isSuccess, revealKey]);

  // Le résumé de l'URL de retour prime sur le stockage local
  const pending = React.useMemo(
    () => (summary ? { amount: summary.amount, reservationData: summary } : readPending(reference)),
    [reference, summary]
  );
  const r = pending?.reservationData;

  const [copied, setCopied] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const needsAck = typeof creds === 'object' && !!creds.password && !saved;
  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt('Copiez :', value);
    }
  };

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

        {isSuccess && creds === 'waiting' && (
          <p className="text-xs text-gray-400 mb-4">Création de votre espace client…</p>
        )}
        {isSuccess && typeof creds === 'object' && (
          <div className="text-left bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border-2 border-orange-400 rounded-xl p-5 mb-4 shadow-lg shadow-orange-500/20">
            <p className="font-bold text-orange-300 text-lg mb-1 text-center">🔑 Votre espace client est prêt !</p>
            <p className="text-xs text-gray-300 text-center mb-4">Suivez vos réservations et gérez votre compte à tout moment.</p>
            <div className="bg-gray-900 rounded-lg p-3 mb-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-gray-400">Identifiant</div>
                <div className="font-mono text-lg break-all">{creds.telephone}</div>
              </div>
              <button onClick={() => copy('id', creds.telephone)} className="shrink-0 bg-gray-700 hover:bg-gray-600 rounded px-3 py-2 text-sm">
                {copied === 'id' ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
            {creds.password ? (
              <>
                <div className="bg-gray-900 rounded-lg p-3 mb-3 flex items-center justify-between gap-2 border border-orange-400">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-400">Mot de passe temporaire</div>
                    <div className="font-mono text-2xl text-orange-300 tracking-wider break-all select-all">{creds.password}</div>
                  </div>
                  <button onClick={() => copy('pw', creds.password as string)} className="shrink-0 bg-orange-500 hover:bg-orange-600 rounded px-3 py-2 text-sm font-semibold">
                    {copied === 'pw' ? 'Copié ✓' : 'Copier'}
                  </button>
                </div>
                <div className="bg-red-500/15 border border-red-400/60 rounded-lg p-3 text-sm text-red-200 mb-3">
                  ⚠️ <strong>Ce mot de passe ne sera plus jamais affiché.</strong> Copiez-le, notez-le ou faites une capture d'écran maintenant.
                  À votre première connexion, vous devrez le remplacer par un mot de passe personnel.
                </div>
                <label className="flex items-start gap-2 text-sm cursor-pointer mb-3">
                  <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1" />
                  J'ai enregistré mon mot de passe
                </label>
              </>
            ) : (
              <p className="text-sm text-gray-300 mb-3">Vous avez déjà un compte : utilisez votre mot de passe habituel.</p>
            )}
            {onOpenClientSpace && (
              <button
                onClick={onOpenClientSpace}
                disabled={!!creds.password && !saved}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-3 font-semibold"
              >
                Accéder à mon espace client
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {isSuccess && (
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 rounded-lg py-3"
            >
              <MessageCircle size={18} /> Confirmer par WhatsApp
            </button>
          )}
          <button onClick={onClose} disabled={needsAck} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-3">
            Retour au site
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
