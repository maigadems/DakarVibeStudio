/*
  # Ajouter politique de suppression pour les réservations

  1. Sécurité
    - Ajouter politique DELETE pour permettre la suppression publique des réservations
    - Nécessaire pour que l'admin puisse supprimer via l'interface
*/

-- Ajouter une politique pour permettre la suppression publique
CREATE POLICY "Permettre suppression publique"
  ON reservations
  FOR DELETE
  TO anon
  USING (true);