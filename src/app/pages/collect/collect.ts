import {
  Component, OnInit, OnDestroy, signal, inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { AudioService } from '../../services/audio.service';
import { LEAVES, shuffleArray, getPlayerId, BattleData } from '../../models/game.models';

@Component({
  selector: 'app-collect',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 relative select-none overflow-hidden">

      <!-- Barre de timer fixe en haut -->
      <div class="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div class="h-1.5 bg-green-100">
          <div class="h-1.5 bg-green-500 transition-none"
               [style.width.%]="timerPercent()"></div>
        </div>
        <div class="flex justify-between items-center px-4 py-2">
          <span class="text-green-700 font-bold text-sm">Hanangona ravina!</span>
          <span class="text-xl font-bold"
                [class]="timeLeft() <= 2 ? 'text-red-500 animate-pulse' : 'text-green-600'">
            {{ timeLeft() }}s
          </span>
          <span class="text-green-600 font-semibold text-sm">
            {{ collected().size }} ravina
          </span>
        </div>
      </div>

      <!-- Grille de feuilles -->
      <div class="pt-14 pb-4 px-2 relative">
        <!-- Fog overlay quand le temps est écoulé -->
        @if (timerDone()) {
          <div class="absolute inset-0 z-10 bg-white/65 backdrop-blur-[3px]
                      pointer-events-none transition-all duration-500"></div>
        }

        <div class="grid grid-cols-4 gap-2 max-w-lg mx-auto"
             [class]="timerDone() ? 'opacity-40 pointer-events-none' : ''">
          @for (leaf of shuffledLeaves; track leaf.id) {
            <button
              (click)="collectLeaf(leaf.id)"
              [class]="collected().has(leaf.id)
                ? 'ring-2 ring-green-500 bg-green-100'
                : 'bg-white active:bg-green-50'"
              class="rounded-xl shadow-sm p-1.5 flex flex-col items-center
                     transition-colors duration-75 border border-green-100 touch-manipulation">
              <img
                [src]="leaf.id + '.jpg'"
                [alt]="leaf.name"
                class="w-full aspect-square object-cover rounded-lg">
              <span class="text-[10px] text-gray-600 text-center leading-tight mt-1 px-0.5">
                {{ leaf.name }}
              </span>
              @if (collected().has(leaf.id)) {
                <span class="text-green-500 text-[10px] font-bold leading-none">✓</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- ══ TANTE qui surgit de la fenêtre ══════════════════════ -->
      @if (showTante()) {
        <div class="fixed inset-0 z-50 pointer-events-none">

          <!-- Bulle de dialogue (apparaît en décalé après tante) -->
          <div class="bubble-in absolute bottom-[200px] right-[140px] w-52 pointer-events-auto"
               (click)="dismissTante()">
            <div class="bg-white rounded-2xl shadow-2xl px-4 py-3 relative border border-green-100">
              <p class="text-gray-800 text-sm font-semibold leading-snug text-center">
                Rankizy a!<br>Aza tangosinareo ny anananako.
              </p>
              <!-- Triangle vers le bas-droite (pointe vers tante) -->
              <div class="absolute -bottom-2.5 right-6
                          border-l-8 border-r-8 border-t-[10px]
                          border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>

          <!-- Tante, inclinée, surgissant du bas-droit -->
          <img
            src="tante.png"
            alt="Tante"
            class="tante-in absolute bottom-0 right-0 w-56 sm:w-72 pointer-events-auto"
            (click)="dismissTante()">

          <!-- Texte "tap pour continuer" -->
          <p class="bubble-in absolute bottom-2 right-4 text-white/60 text-[10px]
                    pointer-events-none" style="animation-delay: 0.9s">
            Tsindrio hanohy
          </p>
        </div>
      }

    </div>
  `,
})
export class CollectComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private audio = inject(AudioService);

  readonly shuffledLeaves = shuffleArray(LEAVES);
  collected = signal<Set<number>>(new Set());

  timeLeft = signal(5);
  timerPercent = signal(100);
  timerDone = signal(false);
  showTante = signal(false);

  private roomCode = '';
  private duration = 5;
  private roomData: any = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private channel: RealtimeChannel | null = null;
  private timerFired = false;
  private navigated = false;

  async ngOnInit() {
    this.roomCode = this.route.snapshot.paramMap.get('code') ?? '';

    const { data } = await this.supabase.client
      .from('rooms').select('*').eq('code', this.roomCode).single();

    if (data) {
      this.roomData = data;
      this.duration = data['duration'] ?? 5;
      const elapsed = (Date.now() - Number(data['started_at'])) / 1000;
      const remaining = Math.max(0, this.duration - elapsed);
      this.timeLeft.set(Math.ceil(remaining));
      this.timerPercent.set((remaining / this.duration) * 100);

      if (remaining <= 0) this.onTimerEnd();
      else this.startTimer(remaining);
    }

    this.channel = this.supabase.client
      .channel(`collect-${this.roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rooms',
        filter: `code=eq.${this.roomCode}`,
      }, ({ new: r }) => {
        if (r['state'] === 'battling') this.goTo('battle');
        if (r['state'] === 'results')  this.goTo('results');
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.channel?.unsubscribe();
  }

  startTimer(remaining: number) {
    const endTime = Date.now() + remaining * 1000;
    this.timerInterval = setInterval(() => {
      const left = (endTime - Date.now()) / 1000;
      if (left <= 0) {
        this.timeLeft.set(0);
        this.timerPercent.set(0);
        clearInterval(this.timerInterval!);
        this.onTimerEnd();
      } else {
        this.timeLeft.set(Math.ceil(left));
        this.timerPercent.set((left / this.duration) * 100);
      }
    }, 100);
  }

  collectLeaf(id: number) {
    if (this.timerFired) return;
    const s = new Set(this.collected());
    if (!s.has(id)) {
      s.add(id);
      this.collected.set(s);
      this.audio.playClick();
    }
  }

  async onTimerEnd() {
    if (this.timerFired) return;
    this.timerFired = true;
    this.timerDone.set(true);

    const playerId = getPlayerId();
    const playerName = sessionStorage.getItem('playerName') ?? 'Mpilalao';

    await this.supabase.client.from('collections').upsert(
      {
        room_code: this.roomCode,
        player_id: playerId,
        player_name: playerName,
        leaves: Array.from(this.collected()),
      },
      { onConflict: 'room_code,player_id' }
    );

    // Légère pause avant l'apparition de tante (effet dramatique)
    setTimeout(() => {
      this.showTante.set(true);
      this.audio.playHey();
    }, 350);

    // Le host prépare et lance l'ady ravina
    if (this.roomData?.host_id === playerId) {
      setTimeout(async () => {
        await this.initBattleAndTransition();
      }, 4500);
    }
  }

  async initBattleAndTransition() {
    const { data: cols } = await this.supabase.client
      .from('collections').select('*').eq('room_code', this.roomCode);

    const players: any[] = this.roomData?.players ?? [];

    const nameMap: Record<string, string> = {};
    const colMap: Record<string, number[]> = {};

    for (const p of players) {
      nameMap[p.id] = p.name;
      colMap[p.id] = [];
    }
    for (const c of cols ?? []) {
      colMap[c['player_id']] = c['leaves'] ?? [];
      nameMap[c['player_id']] = c['player_name'];
    }

    const playerOrder = players.map((p: any) => p.id);

    const battleData: BattleData = {
      player_order: playerOrder,
      player_names: nameMap,
      current_idx: 0,
      hands: JSON.parse(JSON.stringify(colMap)),
      original_collections: JSON.parse(JSON.stringify(colMap)),
      scores: Object.fromEntries(playerOrder.map(id => [id, 0])),
      last_played: null,
      done: false,
    };

    await this.supabase.client.from('rooms').update({
      state: 'battling',
      battle_data: battleData,
    }).eq('code', this.roomCode);

    this.goTo('battle');
  }

  dismissTante() {
    this.goTo('battle');
  }

  private goTo(page: 'battle' | 'results') {
    if (this.navigated) return;
    this.navigated = true;
    this.router.navigate([`/${page}`, this.roomCode]);
  }
}
