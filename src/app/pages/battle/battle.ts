import {
  Component, OnInit, OnDestroy, signal, computed, inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { I18nService } from '../../services/i18n.service';
import { BattleData, getLeafName, getPlayerId } from '../../models/game.models';

@Component({
  selector: 'app-battle',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 pb-8">

      <!-- En-tête scores -->
      <div class="bg-white shadow-sm px-4 pt-4 pb-3 sticky top-0 z-10">
        <h2 class="text-center font-black text-green-800 text-base mb-2">⚔️ Mampiady Ravina</h2>
        <div class="flex justify-around">
          @for (pid of playerOrder(); track pid) {
            <div class="text-center">
              <div class="text-2xl font-black text-green-600">
                {{ scores()[pid] ?? 0 }}
              </div>
              <div class="text-xs text-gray-500 max-w-[64px] truncate">
                {{ playerNames()[pid] }}
              </div>
              @if (phase() === 'dropping' && currentPid() === pid && !showResult()) {
                <div class="text-[10px] text-green-500 font-semibold">{{ t().droppingIndicator }}</div>
              }
            </div>
          }
        </div>
      </div>

      <div class="max-w-sm mx-auto px-4 pt-4">

        <!-- ══ RÉSULTAT DU TOUR PRÉCÉDENT (2.2s) ══ -->
        @if (showResult() && lastPlayed()) {
          <div class="bg-white rounded-2xl shadow-md p-5 mb-4 text-center">
            <p class="text-gray-500 text-xs mb-2">{{ t().roundResult }}</p>
            <img [src]="lastPlayed()!.leaf_id + '.webp'"
                 class="w-20 h-20 object-cover rounded-2xl mx-auto mb-2 shadow-md">
            <p class="font-bold text-green-800 text-sm mb-3 capitalize">
              {{ getLeafName(lastPlayed()!.leaf_id) }}
            </p>
            <div class="flex justify-center gap-6">
              @if (lastPlayed()!.matchers.length) {
                <div>
                  <p class="text-green-600 font-bold text-xs mb-1.5">{{ t().matchedLabel }}</p>
                  @for (n of lastPlayed()!.matchers; track n) {
                    <div class="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-1 mb-1">{{ n }}</div>
                  }
                </div>
              }
              @if (lastPlayed()!.non_matchers.length) {
                <div>
                  <p class="text-red-500 font-bold text-xs mb-1.5">{{ t().noMatchLabel }}</p>
                  @for (n of lastPlayed()!.non_matchers; track n) {
                    <div class="bg-red-50 text-red-500 text-xs rounded-lg px-3 py-1 mb-1">{{ n }}</div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (!showResult() && !done()) {

          <!-- ══ PHASE DROPPING ══ -->
          @if (phase() === 'dropping') {

            @if (isMyTurn()) {
              <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
                <p class="text-center text-green-700 font-bold text-sm mb-3">
                  {{ t().yourTurnDrop }}
                </p>
                @if (myHand().length === 0) {
                  <p class="text-center text-gray-400 text-xs py-4">{{ t().noLeavesAnymore }}</p>
                } @else {
                  <div class="grid grid-cols-4 gap-2">
                    @for (leafId of myHand(); track leafId) {
                      <button
                        (click)="dropLeaf(leafId)"
                        [disabled]="acting()"
                        class="bg-green-50 hover:bg-green-100 active:scale-95 border border-green-200
                               rounded-xl p-1.5 flex flex-col items-center transition-all
                               touch-manipulation disabled:opacity-50">
                        <img [src]="leafId + '.webp'" [alt]="getLeafName(leafId)"
                             class="w-full aspect-square object-cover rounded-lg">
                        <span class="text-[9px] text-gray-600 text-center leading-tight mt-1">
                          {{ getLeafName(leafId) }}
                        </span>
                      </button>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="bg-white rounded-2xl shadow-md p-8 mb-4 text-center">
                <div class="text-4xl mb-3">🌿</div>
                <p class="text-green-700 font-bold text-sm">
                  {{ t().turnPrefix }} <strong>{{ currentPlayerName() }}</strong>{{ t().turnSuffix }}
                </p>
                <p class="text-gray-400 text-xs mt-1 animate-pulse">{{ t().waitingToDrop }}</p>
              </div>
            }

          }

          <!-- ══ PHASE RESPONDING ══ -->
          @if (phase() === 'responding') {

            <!-- Feuille posée visible par tous -->
            <div class="bg-white rounded-2xl shadow-md p-4 mb-3 text-center">
              <p class="text-gray-500 text-xs mb-2">
                <strong class="text-green-700">{{ currentPlayerName() }}</strong> {{ t().droppedBy }}
              </p>
              <img [src]="droppedLeaf()! + '.webp'"
                   class="w-24 h-24 object-cover rounded-2xl mx-auto mb-1.5 shadow-md">
              <p class="font-bold text-green-800 text-sm capitalize">
                {{ getLeafName(droppedLeaf()!) }}
              </p>
            </div>

            @if (isMyTurn()) {
              <!-- Je suis le dropper : j'attends les réponses -->
              <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
                <p class="text-green-700 font-bold text-sm mb-3 text-center">
                  {{ t().waitingResponses }}
                </p>
                <div class="flex flex-col gap-2">
                  @for (pid of nonDroppers(); track pid) {
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl"
                         [class]="hasResponded(pid) ? 'bg-green-50' : 'bg-gray-50'">
                      <span class="text-base">{{ hasResponded(pid) ? '✅' : '⏳' }}</span>
                      <span class="text-sm text-gray-700">{{ playerNames()[pid] }}</span>
                    </div>
                  }
                </div>
              </div>

            } @else if (!hasResponded(myPid)) {
              <!-- Mon tour de répondre -->
              <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
                <p class="text-center text-green-700 font-bold text-sm mb-3">
                  {{ t().haveLeafQuestion }}
                </p>
                @if (myHand().length > 0) {
                  <div class="grid grid-cols-4 gap-2 mb-3">
                    @for (leafId of myHand(); track leafId) {
                      <button
                        (click)="tryLeaf(leafId)"
                        [disabled]="acting()"
                        class="bg-green-50 hover:bg-green-100 active:scale-95 border border-green-200
                               rounded-xl p-1.5 flex flex-col items-center transition-all
                               touch-manipulation disabled:opacity-50 relative"
                        [class.ring-2]="selectedLeaf() === leafId"
                        [class.ring-green-500]="selectedLeaf() === leafId && leafId === droppedLeaf()"
                        [class.ring-red-400]="selectedLeaf() === leafId && leafId !== droppedLeaf()">
                        <img [src]="leafId + '.webp'" [alt]="getLeafName(leafId)"
                             class="w-full aspect-square object-cover rounded-lg">
                        <span class="text-[9px] text-gray-600 text-center leading-tight mt-1">
                          {{ getLeafName(leafId) }}
                        </span>
                        @if (selectedLeaf() === leafId && leafId !== droppedLeaf()) {
                          <div class="absolute inset-0 rounded-xl bg-red-500/15 flex items-center justify-center pointer-events-none">
                            <span class="text-xl leading-none">❌</span>
                          </div>
                        }
                      </button>
                    }
                  </div>
                } @else {
                  <p class="text-center text-gray-400 text-xs mb-3">{{ t().noLeavesInHand }}</p>
                }
                <button (click)="tryTsyManana()" [disabled]="acting()"
                        class="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm
                               active:bg-gray-200 transition-colors disabled:opacity-50 select-none">
                  {{ t().dontHaveBtn }}
                </button>
                @if (showTsyMananaWarn()) {
                  <div class="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-xl text-center">
                    <p class="text-yellow-700 text-xs font-bold">{{ t().checkHaveIt }}</p>
                  </div>
                }
              </div>

            } @else {
              <!-- J'ai déjà répondu -->
              @if (myResponseValue() === droppedLeaf()) {
                <div class="bg-green-50 border-2 border-green-300 rounded-2xl p-5 mb-3 text-center">
                  <div class="text-3xl mb-1">✅</div>
                  <p class="font-black text-green-700 text-xl">{{ t().matchedResult }}</p>
                  <p class="text-green-500 text-xs mt-1">{{ t().plusOne }}</p>
                </div>
              } @else {
                <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-3 text-center">
                  <div class="text-3xl mb-1">🚫</div>
                  <p class="font-bold text-gray-600 text-sm">{{ t().dontHaveCard }}</p>
                </div>
              }
              <!-- Attente des autres -->
              <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
                <p class="text-center text-green-600 text-xs animate-pulse mb-3">
                  {{ t().waitingOthers }}
                </p>
                <div class="flex flex-col gap-2">
                  @for (pid of nonDroppers(); track pid) {
                    @if (pid !== myPid) {
                      <div class="flex items-center gap-2 px-3 py-2 rounded-xl"
                           [class]="hasResponded(pid) ? 'bg-green-50' : 'bg-gray-50'">
                        <span class="text-base">{{ hasResponded(pid) ? '✅' : '⏳' }}</span>
                        <span class="text-sm text-gray-700">{{ playerNames()[pid] }}</span>
                      </div>
                    }
                  }
                </div>
              </div>
            }

          }

        }

        <!-- Partie terminée -->
        @if (done()) {
          <div class="bg-white rounded-2xl shadow-md p-8 mb-4 text-center">
            <div class="text-4xl mb-2">🎉</div>
            <p class="text-green-700 font-bold">{{ t().battleDone }}</p>
            <p class="text-gray-400 text-xs mt-1 animate-pulse">{{ t().waitingResults }}</p>
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
  private i18n = inject(I18nService);
  readonly t = this.i18n.t;

  battleData        = signal<BattleData | null>(null);
  showResult        = signal(false);
  acting            = signal(false);
  selectedLeaf      = signal<number | null>(null);
  showTsyMananaWarn = signal(false);

  readonly myPid = getPlayerId();

  playerOrder  = computed(() => this.battleData()?.player_order ?? []);
  playerNames  = computed(() => this.battleData()?.player_names ?? {});
  scores       = computed(() => this.battleData()?.scores ?? {});
  phase        = computed(() => this.battleData()?.phase ?? 'dropping');
  droppedLeaf  = computed(() => this.battleData()?.dropped_leaf ?? null);
  responses    = computed(() => this.battleData()?.responses ?? {} as Record<string, number | null>);
  lastPlayed   = computed(() => this.battleData()?.last_played ?? null);
  done         = computed(() => this.battleData()?.done ?? false);

  currentPid = computed(() => {
    const bd = this.battleData();
    if (!bd || bd.current_idx < 0) return '';
    return bd.player_order[bd.current_idx] ?? '';
  });
  currentPlayerName = computed(() => this.playerNames()[this.currentPid()] ?? '');
  isMyTurn  = computed(() => this.currentPid() === this.myPid);
  myHand    = computed(() => this.battleData()?.hands[this.myPid] ?? []);
  nonDroppers = computed(() => this.playerOrder().filter(pid => pid !== this.currentPid()));

  // undefined = n'a pas encore répondu, null = Tsy manana, number = feuille choisie (= droppedLeaf)
  myResponseValue = computed(() => {
    const r = this.responses();
    return this.myPid in r ? r[this.myPid] : undefined;
  });

  hasResponded = (pid: string) => pid in this.responses();

  readonly getLeafName = getLeafName;

  private code = '';
  private channel: RealtimeChannel | null = null;
  private resultTimeout: ReturnType<typeof setTimeout> | null = null;
  private navigated  = false;
  private resolving  = false;

  async ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';

    const { data } = await this.supabase.client
      .from('rooms').select('battle_data, state').eq('code', this.code).single();

    if (data?.['battle_data']) this.applyUpdate(data['battle_data']);
    if (data?.['state'] === 'results') { this.goToResults(); return; }

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
    const prevPhase = this.battleData()?.phase;
    this.battleData.set(bd);

    // Réinitialiser l'état local quand un nouveau tour commence
    if (prevPhase === 'responding' && bd.phase === 'dropping') {
      this.selectedLeaf.set(null);
      this.showTsyMananaWarn.set(false);
    }

    if (bd.last_played && bd.phase === 'dropping' && !bd.done) {
      this.showResult.set(true);
      if (this.resultTimeout) clearTimeout(this.resultTimeout);
      this.resultTimeout = setTimeout(() => this.showResult.set(false), 2200);
    }

    if (bd.done && !this.navigated) {
      if (this.resultTimeout) clearTimeout(this.resultTimeout);
      setTimeout(() => this.goToResults(), 2200);
    }

    this.checkAndResolve(bd);
  }

  private checkAndResolve(bd: BattleData) {
    if (bd.phase !== 'responding' || this.resolving) return;

    const dropperPid = bd.player_order[bd.current_idx];
    const allDone = bd.player_order
      .filter(pid => pid !== dropperPid)
      .every(pid => pid in bd.responses);

    if (allDone) this.resolveRound(bd);
  }

  private resolveRound(bd: BattleData) {
    this.resolving = true;
    const dropperId  = bd.player_order[bd.current_idx];
    const droppedLeaf = bd.dropped_leaf!;

    const matchers: string[]    = [];
    const nonMatchers: string[] = [];

    // Le dropper gagne TOUJOURS +1
    bd.scores[dropperId] = (bd.scores[dropperId] ?? 0) + 1;
    matchers.push(bd.player_names[dropperId]);

    for (const pid of bd.player_order) {
      if (pid === dropperId) continue;
      const chosen = bd.responses[pid];
      if (chosen === droppedLeaf) {
        bd.scores[pid] = (bd.scores[pid] ?? 0) + 1;
        matchers.push(bd.player_names[pid]);
      } else {
        nonMatchers.push(bd.player_names[pid]);
      }
    }

    // Retirer UNE SEULE instance de la feuille jouée de la main de TOUS les joueurs
    for (const pid of bd.player_order) {
      const hand = [...(bd.hands[pid] ?? [])];
      const idx = hand.indexOf(droppedLeaf);
      if (idx !== -1) hand.splice(idx, 1);
      bd.hands[pid] = hand;
    }

    bd.last_played = {
      leaf_id: droppedLeaf,
      dropper_id: dropperId,
      dropper_name: bd.player_names[dropperId],
      matchers,
      non_matchers: nonMatchers,
    };

    bd.phase        = 'dropping';
    bd.dropped_leaf = null;
    bd.responses    = {};

    // Prochain dropper (chercher un joueur avec une main non vide)
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

    this.supabase.client.from('rooms').update({
      battle_data: bd,
      ...(bd.done ? { state: 'results' } : {}),
    }).eq('code', this.code).then(() => { this.resolving = false; });

    this.applyUpdate(bd);
  }

  async dropLeaf(leafId: number) {
    if (!this.isMyTurn() || this.acting() || this.phase() !== 'dropping') return;
    this.acting.set(true);

    const { data: room } = await this.supabase.client
      .from('rooms').select('battle_data').eq('code', this.code).single();
    if (!room?.['battle_data']) { this.acting.set(false); return; }

    const bd: BattleData = JSON.parse(JSON.stringify(room['battle_data']));
    if (bd.phase !== 'dropping') { this.acting.set(false); return; }

    bd.phase        = 'responding';
    bd.dropped_leaf = leafId;
    bd.responses    = {};

    await this.supabase.client.from('rooms').update({ battle_data: bd }).eq('code', this.code);
    this.applyUpdate(bd);
    this.acting.set(false);
  }

  tryLeaf(leafId: number) {
    if (this.isMyTurn() || this.acting() || this.phase() !== 'responding') return;
    if (this.hasResponded(this.myPid)) return;

    const dropped = this.droppedLeaf();
    if (dropped === null) return;

    this.showTsyMananaWarn.set(false);
    this.selectedLeaf.set(leafId);

    if (leafId === dropped) {
      // Feuille correcte → soumettre
      this.submitResponse(leafId);
    }
    // Sinon : overlay "Tsy mitovy ❌" affiché, le joueur peut réessayer
  }

  tryTsyManana() {
    if (this.isMyTurn() || this.acting() || this.phase() !== 'responding') return;
    if (this.hasResponded(this.myPid)) return;

    const dropped = this.droppedLeaf();
    if (dropped === null) return;

    if (this.myHand().includes(dropped)) {
      // Il a la feuille → avertissement
      this.showTsyMananaWarn.set(true);
      this.selectedLeaf.set(null);
    } else {
      // Il n'a pas la feuille → soumettre
      this.showTsyMananaWarn.set(false);
      this.submitResponse(null);
    }
  }

  private async submitResponse(leafId: number | null) {
    this.acting.set(true);

    const { data: room } = await this.supabase.client
      .from('rooms').select('battle_data').eq('code', this.code).single();
    if (!room?.['battle_data']) { this.acting.set(false); return; }

    const bd: BattleData = JSON.parse(JSON.stringify(room['battle_data']));
    if (bd.phase !== 'responding') { this.acting.set(false); return; }

    (bd.responses as any)[this.myPid] = leafId;

    await this.supabase.client.from('rooms').update({ battle_data: bd }).eq('code', this.code);
    this.applyUpdate(bd);
    this.acting.set(false);
  }

  private goToResults() {
    if (this.navigated) return;
    this.navigated = true;
    this.router.navigate(['/results', this.code]);
  }
}
