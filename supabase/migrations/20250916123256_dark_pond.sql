/*
  # Création de la table des réservations

  1. Nouvelle Table
    - `reservations`
      - `id` (uuid, clé primaire)
      - `nom` (text, nom du client)
      - `email` (text, email du client)
      - `telephone` (text, numéro de téléphone)
      - `message` (text, message optionnel)
      - `date_reservation` (date, date de la réservation)
      - `creneaux` (text[], liste des créneaux réservés)
      - `duree_heures` (integer, nombre d'heures)
      - `montant_total` (integer, montant en FCFA)
      - `statut` (text, statut de la réservation)
      - `created_at` (timestamp, date de création)
      - `updated_at` (timestamp, date de modification)

  2. Sécurité
    - Activer RLS sur la table `reservations`
    - Politique pour permettre la lecture et l'écriture publique (pour les réservations)
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  message text DEFAULT '',
  date_reservation date NOT NULL,
  creneaux text[] NOT NULL,
  duree_heures integer NOT NULL,
  montant_total integer NOT NULL,
  statut text DEFAULT 'en_attente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour les nouvelles réservations)
CREATE POLICY "Permettre insertion publique"
  ON reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique pour permettre la lecture publique (pour l'admin)
CREATE POLICY "Permettre lecture publique"
  ON reservations
  FOR SELECT
  TO anon
  USING (true);

-- Politique pour permettre la mise à jour publique (pour modifier le statut)
CREATE POLICY "Permettre mise à jour publique"
  ON reservations
  FOR UPDATE
  TO anon
  USING (true);

-- Index pour optimiser les requêtes par date
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date_reservation);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);