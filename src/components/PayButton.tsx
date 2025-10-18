import React, { useState } from "react";

interface PayButtonProps {
  amount: number;
  description: string;
  name: string;
  date: string;
}

interface PaymentResponse {
  redirectUrl?: string;
  message?: string;
  error?: boolean;
  amount: number;
  description: string;
}

const PayButton: React.FC<PayButtonProps> = ({ amount, description, name, date }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://back-westaf.onrender.com/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          name,
          date
        }),
      });

      const data: PaymentResponse = await response.json();

      if (data.redirectUrl) {
        // ✅ Redirection vers PayTech
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.message || "Impossible de créer le paiement");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du paiement. Vérifie la console.");
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
