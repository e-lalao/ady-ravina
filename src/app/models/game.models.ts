export interface Player {
  id: string;
  name: string;
}

export interface Room {
  code: string;
  host_id: string;
  host_name: string;
  players: Player[];
  state: 'waiting' | 'collecting' | 'battling' | 'results';
  duration: number;
  started_at: number | null;
  battle_data: BattleData | null;
}

export interface BattleData {
  player_order: string[];
  player_names: Record<string, string>;
  current_idx: number;
  hands: Record<string, number[]>;
  original_collections: Record<string, number[]>;
  scores: Record<string, number>;
  last_played: LastPlayed | null;
  done: boolean;
}

export interface LastPlayed {
  leaf_id: number;
  dropper_id: string;
  dropper_name: string;
  matchers: string[];
  non_matchers: string[];
}

export interface Collection {
  room_code: string;
  player_id: string;
  player_name: string;
  leaves: number[];
}

export const LEAVES: { id: number; name: string }[] = [
  { id: 1,  name: 'akondro' },
  { id: 2,  name: 'feli-morongo' },
  { id: 3,  name: 'konikony' },
  { id: 4,  name: 'manga' },
  { id: 5,  name: 'mangahazo' },
  { id: 6,  name: 'paiso' },
  { id: 7,  name: 'paoma' },
  { id: 8,  name: 'papay' },
  { id: 9,  name: 'ravim-bomanga' },
  { id: 10, name: 'sakamalao' },
  { id: 11, name: 'sakay' },
  { id: 12, name: 'voatabia' },
  { id: 13, name: 'voaloboka' },
  { id: 14, name: 'voamadiro' },
  { id: 15, name: 'voanio' },
  { id: 16, name: 'voaroy' },
  { id: 17, name: 'voasary' },
  { id: 18, name: 'voatavo' },
  { id: 19, name: 'zavoka' },
  { id: 20, name: 'voanjo' },
];

export function getLeafName(id: number): string {
  return LEAVES.find(l => l.id === id)?.name ?? `#${id}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function getPlayerId(): string {
  let id = sessionStorage.getItem('playerId');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('playerId', id);
  }
  return id;
}
