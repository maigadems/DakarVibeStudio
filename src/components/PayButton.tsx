import React, { useState } from "react";

interface PayButtonProps {
  amount: number;
  description: string;
  name: string;
  date: string;
  reservationData: {
    nom: string;
    email: string;
    telephone: string;
    message: string;
    date_reservation: string;
    creneaux?: string[] | null;
    duree_heures?: number | null;
    montant_total: number;
    type_service: 'horaire' | 'mixage' | 'mastering';
    nombre_titres?: number | null;
  };
}

interface PaymentResponse {
  redirectUrl?: string;
  message?: string;
  error?: boolean;
  amount: number;
  description: string;
}

const PayButton: React.FC<PayButtonProps> = ({ amount, description, name, date, reservationData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // ⚠️ IMPORTANT: Le backend doit être mis à jour pour accepter reservationData
      // En attendant, on envoie les deux formats pour compatibilité
      const payload: any = {
        amount,
        description,
        name,
        date
      };

      // ✅ Ajouter reservationData si le backend est mis à jour
      // Le nouveau backend utilisera ces données pour créer la réservation après paiement
      if (reservationData) {
        payload.reservationData = reservationData;
      }

      console.log('📤 Envoi de la requête de paiement:', payload);

      const response = await fetch("https://back-westaf.onrender.com/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('📥 Statut de la réponse:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur backend:', errorText);
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }

      const data: PaymentResponse = await response.json();
      console.log('📥 Données reçues:', data);

      if (data.redirectUrl) {
        console.log('✅ Redirection vers PayTech');
        // ✅ Redirection vers PayTech
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.message || "Impossible de créer le paiement");
      }
    } catch (err: any) {
      console.error('❌ Erreur complète:', err);
      setError(err.message || "Erreur lors du paiement. Consultez la console pour plus de détails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          backgroundColor: "#2D9CDB",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirection..." : "Payer maintenant"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default PayButton;
