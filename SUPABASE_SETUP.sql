-- Ady Ravina — Supabase setup
-- Run this in: Supabase Dashboard > SQL Editor

-- 1. Table des salles
CREATE TABLE IF NOT EXISTS public.rooms (
  code        TEXT PRIMARY KEY,
  host_id     TEXT NOT NULL,
  host_name   TEXT NOT NULL DEFAULT '',
  players     JSONB NOT NULL DEFAULT '[]',
  state       TEXT NOT NULL DEFAULT 'waiting',  -- waiting | collecting | results
  duration    INTEGER NOT NULL DEFAULT 5,
  started_at  BIGINT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des collections de feuilles
CREATE TABLE IF NOT EXISTS public.collections (
  room_code   TEXT REFERENCES public.rooms(code) ON DELETE CASCADE,
  player_id   TEXT NOT NULL,
  player_name TEXT NOT NULL,
  leaves      INTEGER[] NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_code, player_id)
);

-- 3. Row Level Security (open — le code de salle sert de contrôle d'accès)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_open" ON public.rooms;
DROP POLICY IF EXISTS "collections_open" ON public.collections;

CREATE POLICY "rooms_open" ON public.rooms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "collections_open" ON public.collections
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Activer Realtime sur ces tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;

-- 5. (Optionnel) Nettoyage auto des vieilles salles après 24 h
-- Vous pouvez créer un pg_cron job ou un Edge Function pour ça.
