import {
  Component, OnInit, OnDestroy, signal, computed, inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { BattleData, getLeafName, getPlayerId } from '../../models/game.models';

@Component({
  selector: 'app-battle',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 pb-8">

      <!-- En-tête scores -->
      <div class="bg-white shadow-sm px-4 pt-4 pb-3 sticky top-0 z-10">
        <h2 class="text-center font-black text-green-800 text-base mb-2">⚔️ Ady Ravina</h2>
        <div class="flex justify-around">
          @for (pid of playerOrder(); track pid) {
            <div class="text-center"
                 [class]="currentPid() === pid ? 'opacity-100' : 'opacity-50'">
              <div class="text-2xl font-black"
                   [class]="currentPid() === pid ? 'text-green-600' : 'text-gray-400'">
                {{ scores()[pid] || 0 }}
              </div>
              <div class="text-xs text-gray-500 max-w-[64px] truncate">
                {{ playerNames()[pid] }}
              </div>
              @if (currentPid() === pid) {
                <div class="text-[10px] text-green-500 font-semibold">▲ mandatsaka</div>
              }
            </div>
          }
        </div>
      </div>

      <div class="max-w-sm mx-auto px-4 pt-4">

        <!-- Résultat du dernier coup -->
        @if (showResult() && lastPlayed()) {
          <div class="bg-white rounded-2xl shadow-md p-5 mb-4 text-center">
            <p class="text-gray-500 text-xs mb-2">
              <strong class="text-green-700">{{ lastPlayed()!.dropper_name }}</strong>
              nandatsaka:
            </p>
            <img [src]="'/' + lastPlayed()!.leaf_id + '.jpg'"
                 class="w-24 h-24 object-cover rounded-2xl mx-auto mb-2 shadow-md">
            <p class="font-bold text-green-800 mb-3 text-sm capitalize">
              {{ getLeafName(lastPlayed()!.leaf_id) }}
            </p>

            <div class="flex justify-center gap-6">
              @if (lastPlayed()!.matchers.length) {
                <div>
                  <p class="text-green-600 font-bold text-xs mb-1.5">✓ Manana (+1)</p>
                  @for (n of lastPlayed()!.matchers; track n) {
                    <div class="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-1 mb-1">
                      {{ n }}
                    </div>
                  }
                </div>
              }
              @if (lastPlayed()!.non_matchers.length) {
                <div>
                  <p class="text-red-500 font-bold text-xs mb-1.5">✗ Tsy manana</p>
                  @for (n of lastPlayed()!.non_matchers; track n) {
                    <div class="bg-red-50 text-red-500 text-xs rounded-lg px-3 py-1 mb-1">
                      {{ n }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Mon tour : choisir une feuille -->
        @if (!showResult() && isMyTurn() && !done()) {
          <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
            <p class="text-center text-green-700 font-bold text-sm mb-3">
              Anjara-manao! Safidio ny ravinao hatatsahana:
            </p>
            <div class="grid grid-cols-4 gap-2">
              @for (leafId of myHand(); track leafId) {
                <button
                  (click)="playLeaf(leafId)"
                  [disabled]="playing()"
                  class="bg-green-50 hover:bg-green-100 active:scale-95 border border-green-200
                         rounded-xl p-1.5 flex flex-col items-center transition-all
                         touch-manipulation disabled:opacity-50">
                  <img [src]="'/' + leafId + '.jpg'" [alt]="getLeafName(leafId)"
                       class="w-full aspect-square object-cover rounded-lg">
                  <span class="text-[9px] text-gray-600 text-center leading-tight mt-1">
                    {{ getLeafName(leafId) }}
                  </span>
                </button>
              }
            </div>
            @if (myHand().length === 0) {
              <p class="text-center text-gray-400 text-xs py-4">
                Tsy misy ravina intsony eo aminao.
              </p>
            }
          </div>
        }

        <!-- Tour de l'autre joueur -->
        @if (!isMyTurn() && !done() && !showResult()) {
          <div class="bg-white rounded-2xl shadow-md p-8 mb-4 text-center">
            <div class="text-4xl mb-3">⏳</div>
            <p class="text-green-700 font-bold text-sm">
              Anjaran'i <strong>{{ currentPlayerName() }}</strong>
            </p>
            <p class="text-gray-400 text-xs mt-1 animate-pulse">mandatsaka ravina...</p>
          </div>
        }

        <!-- Partie terminée -->
        @if (done()) {
          <div class="bg-white rounded-2xl shadow-md p-8 mb-4 text-center">
            <div class="text-4xl mb-2">🎉</div>
            <p class="text-green-700 font-bold">Vita ny Ady Ravina!</p>
            <p class="text-gray-400 text-xs mt-1 animate-pulse">Miandry ny vokatra...</p>
          </div>
        }

      </div>
    </div>
  `,
})
export class BattleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  battleData = signal<BattleData | null>(null);
  showResult = signal(false);
  playing = signal(false);

  playerOrder = computed(() => this.battleData()?.player_order ?? []);
  playerNames = computed(() => this.battleData()?.player_names ?? {});
  scores = computed(() => this.battleData()?.scores ?? {});
  currentPid = computed(() => {
    const bd = this.battleData();
    if (!bd || bd.current_idx < 0) return '';
    return bd.player_order[bd.current_idx] ?? '';
  });
  currentPlayerName = computed(() => this.playerNames()[this.currentPid()] ?? '');
  lastPlayed = computed(() => this.battleData()?.last_played ?? null);
  done = computed(() => this.battleData()?.done ?? false);
  isMyTurn = computed(() => this.currentPid() === getPlayerId());
  myHand = computed(() => {
    const bd = this.battleData();
    if (!bd) return [];
    return bd.hands[getPlayerId()] ?? [];
  });

  readonly getLeafName = getLeafName;

  private code = '';
  private channel: RealtimeChannel | null = null;
  private resultTimeout: ReturnType<typeof setTimeout> | null = null;
  private navigated = false;

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';

    const { data } = await this.supabase.client
      .from('rooms').select('battle_data, state').eq('code', this.code).single();

    if (data?.['battle_data']) {
      this.applyUpdate(data['battle_data']);
    }
    if (data?.['state'] === 'results') {
      this.goToResults();
      return;
    }

    this.channel = this.supabase.client
      .channel(`battle-${this.code}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rooms',
        filter: `code=eq.${this.code}`,
      }, ({ new: r }) => {
        if (r['battle_data']) this.applyUpdate(r['battle_data']);
        if (r['state'] === 'results') this.goToResults();
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
    if (this.resultTimeout) clearTimeout(this.resultTimeout);
  }

  private applyUpdate(bd: BattleData) {
    this.battleData.set(bd);

    if (bd.last_played) {
      this.showResult.set(true);
      if (this.resultTimeout) clearTimeout(this.resultTimeout);
      this.resultTimeout = setTimeout(() => {
        this.showResult.set(false);
        if (bd.done) this.goToResults();
      }, 2200);
    }

    if (bd.done && !bd.last_played) {
      this.goToResults();
    }
  }

  async playLeaf(leafId: number) {
    if (!this.isMyTurn() || this.playing() || this.done()) return;
    this.playing.set(true);

    // Relire pour avoir l'état le plus récent
    const { data: room } = await this.supabase.client
      .from('rooms').select('battle_data').eq('code', this.code).single();

    if (!room?.['battle_data']) { this.playing.set(false); return; }

    const bd: BattleData = JSON.parse(JSON.stringify(room['battle_data']));
    const myId = getPlayerId();

    // Retirer la feuille de la main
    bd.hands[myId] = bd.hands[myId].filter(id => id !== leafId);

    // Vérifier qui a la feuille (sur les collections originales)
    const matchers: string[] = [];
    const nonMatchers: string[] = [];
    for (const pid of bd.player_order) {
      const hasIt = (bd.original_collections[pid] ?? []).includes(leafId);
      if (hasIt) {
        matchers.push(bd.player_names[pid]);
        bd.scores[pid] = (bd.scores[pid] ?? 0) + 1;
      } else {
        nonMatchers.push(bd.player_names[pid]);
      }
    }

    bd.last_played = {
      leaf_id: leafId,
      dropper_id: myId,
      dropper_name: bd.player_names[myId],
      matchers,
      non_matchers: nonMatchers,
    };

    // Passer au joueur suivant qui a encore des feuilles
    const n = bd.player_order.length;
    let nextIdx = (bd.current_idx + 1) % n;
    let tries = 0;
    while (tries < n) {
      if ((bd.hands[bd.player_order[nextIdx]] ?? []).length > 0) break;
      nextIdx = (nextIdx + 1) % n;
      tries++;
    }

    const allEmpty = bd.player_order.every(pid => (bd.hands[pid] ?? []).length === 0);

    if (allEmpty) {
      bd.done = true;
      bd.current_idx = -1;
    } else {
      bd.current_idx = nextIdx;
    }

    await this.supabase.client.from('rooms').update({
      battle_data: bd,
      ...(bd.done ? { state: 'results' } : {}),
    }).eq('code', this.code);

    this.playing.set(false);
  }

  private goToResults() {
    if (this.navigated) return;
    this.navigated = true;
    setTimeout(() => this.router.navigate(['/results', this.code]), 800);
  }
}
