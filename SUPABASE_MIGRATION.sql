-- Ady Ravina — Migration (à executer dans: Supabase Dashboard > SQL Editor)
-- Copiez chaque bloc séparément si vous avez des erreurs d'extension

-- ══════════════════════════════════════════════════════════════════
-- A. Colonne battle_data (si pas encore ajoutée)
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS battle_data JSONB;

-- Colonne updated_at pour le nettoyage automatique
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger pour mettre à jour updated_at à chaque modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ══════════════════════════════════════════════════════════════════
-- B. Nettoyage auto des vieilles salles après 24h (pg_cron)
-- ══════════════════════════════════════════════════════════════════

-- Activer l'extension pg_cron (disponible sur Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO postgres;

-- Fonction qui supprime les salles inactives depuis plus de 24h
-- (les collections sont supprimées en cascade via ON DELETE CASCADE)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Planifier l'exécution toutes les heures
-- (supprime l'ancien job s'il existe déjà, sans erreur sinon)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'cleanup-old-rooms';

SELECT cron.schedule(
  'cleanup-old-rooms',
  '0 * * * *',        -- toutes les heures à :00
  'SELECT cleanup_old_rooms()'
);


-- ══════════════════════════════════════════════════════════════════
-- C. Compteur de visiteurs (Mpitsidika)
-- ══════════════════════════════════════════════════════════════════

-- Table avec une seule ligne (id = 1)
CREATE TABLE IF NOT EXISTS public.site_stats (
  id        INTEGER PRIMARY KEY DEFAULT 1,
  visitors  BIGINT  NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la ligne initiale
INSERT INTO public.site_stats (id, visitors)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- RLS : lecture publique, écriture via RPC seulement
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_stats_read" ON public.site_stats;
CREATE POLICY "site_stats_read" ON public.site_stats
  FOR SELECT USING (true);

-- Fonction RPC sécurisée : incrémente et retourne le nouveau total
-- SECURITY DEFINER = s'exécute avec les droits du propriétaire (postgres)
-- donc pas besoin de politique UPDATE pour l'anon
CREATE OR REPLACE FUNCTION increment_visitors()
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.site_stats
  SET visitors = visitors + 1, updated_at = NOW()
  WHERE id = 1
  RETURNING visitors INTO new_count;
  RETURN new_count;
END;
$$;

-- Autoriser les anonymes à appeler la fonction
GRANT EXECUTE ON FUNCTION increment_visitors() TO anon;
GRANT EXECUTE ON FUNCTION increment_visitors() TO authenticated;
