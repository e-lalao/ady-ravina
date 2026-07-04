import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { AudioService } from '../../services/audio.service';
import { I18nService } from '../../services/i18n.service';
import { BattleData, getPlayerId } from '../../models/game.models';

interface PlayerResult {
  id: string;
  name: string;
  leavesCount: number;
  score: number;
}

@Component({
  selector: 'app-results',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 pb-8">

      <!-- En-tête -->
      <div class="bg-gradient-to-br from-green-800 to-green-600 pt-10 pb-8 px-4 text-center">
        <div class="text-5xl mb-2">🏆</div>
        <h1 class="text-2xl font-black text-white">{{ t().resultsTitle }}</h1>
      </div>

      <div class="max-w-sm mx-auto px-4 -mt-4">

        @if (loading()) {
          <div class="bg-white rounded-2xl shadow-md p-8 text-center">
            <p class="text-green-500 animate-pulse text-sm">{{ t().resultLoading }}</p>
          </div>
        }

        @if (!loading()) {

          <!-- Gagnant -->
          @if (winner()) {
            <div class="bg-yellow-50 border-2 border-yellow-300 rounded-2xl shadow-md p-6 mb-4 text-center">
              <div class="text-4xl mb-1">🥇</div>
              <p class="text-xl font-black text-yellow-700">{{ winner()!.name }}</p>
              <p class="text-yellow-600 text-sm">{{ t().winnerLabel }} — {{ winner()!.score }}</p>
            </div>
          }

          <!-- Classement -->
          <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
            <h3 class="text-green-700 font-bold text-sm mb-3 text-center">{{ t().rankingLabel }}</h3>
            <div class="flex flex-col gap-2">
              @for (p of sorted(); track p.id; let i = $index) {
                <div class="flex items-center gap-3 p-3 rounded-xl"
                     [class]="i === 0 ? 'bg-yellow-50' : 'bg-gray-50'">
                  <span class="text-xl font-black w-6 text-center"
                        [class]="i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-400'">
                    {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-sm truncate">{{ p.name }}</p>
                    <p class="text-gray-400 text-xs">{{ p.leavesCount }} {{ t().leavesCollected }}</p>
                  </div>
                  <span class="text-lg font-black text-green-600 flex-shrink-0">
                    {{ p.score }} pts
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Boutons -->
          @if (isHost()) {
            <button (click)="playAgain()"
                    class="w-full bg-green-500 hover:bg-green-600 text-white font-bold
                           py-4 rounded-xl text-base transition-colors mb-3 select-none">
              {{ t().playAgain }}
            </button>
          } @else {
            <p class="text-center text-green-500 text-sm animate-pulse py-2">
              {{ t().waitingForHostResults }}
            </p>
          }

          <button (click)="router.navigate(['/'])"
                  class="w-full border-2 border-green-300 text-green-600 font-bold
                         py-3 rounded-xl text-sm transition-colors select-none">
            {{ t().backToHome }}
          </button>
        }

      </div>
    </div>
  `,
})
export class ResultsComponent implements OnInit, OnDestroy {
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private audio = inject(AudioService);
  readonly i18n = inject(I18nService);
  readonly t = this.i18n.t;

  loading = signal(true);
  results = signal<PlayerResult[]>([]);
  sorted = computed(() => [...this.results()].sort((a, b) => b.score - a.score));
  winner = computed(() => this.sorted()[0] ?? null);
  isHost = computed(() => this._hostId === getPlayerId());

  private code = '';
  private _hostId = '';
  private channel: RealtimeChannel | null = null;
  private wouchehed = false;

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';

    const { data } = await this.supabase.client
      .from('rooms').select('*').eq('code', this.code).single();

    if (data) {
      this._hostId = data['host_id'] ?? '';
      this.buildResults(data['battle_data']);
    }

    this.channel = this.supabase.client
      .channel(`results-${this.code}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rooms',
        filter: `code=eq.${this.code}`,
      }, ({ new: r }) => {
        if (r['state'] === 'waiting') this.router.navigate(['/room', this.code]);
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
  }

  private buildResults(bd: BattleData | null) {
    if (!bd) { this.loading.set(false); return; }

    const playerResults: PlayerResult[] = bd.player_order.map(pid => ({
      id: pid,
      name: bd.player_names[pid] ?? pid,
      leavesCount: (bd.original_collections[pid] ?? []).length,
      score: bd.scores[pid] ?? 0,
    }));

    this.results.set(playerResults);
    this.loading.set(false);

    if (!this.wouchehed) {
      this.wouchehed = true;
      this.audio.playWoueh();
    }
  }

  async playAgain() {
    await this.supabase.client
      .from('collections').delete().eq('room_code', this.code);
    await this.supabase.client
      .from('rooms')
      .update({ state: 'waiting', started_at: null, battle_data: null })
      .eq('code', this.code);
    this.router.navigate(['/room', this.code]);
  }
}
