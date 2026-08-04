import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { I18nService } from '../../services/i18n.service';
import { getPlayerId } from '../../models/game.models';

@Component({
  selector: 'app-room',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-7 w-full max-w-sm border border-green-100">

        <div class="flex justify-center mb-5">
          <img src="accueil-Ady-ravina.webp" alt="Ady Ravina"
               class="w-full max-h-36 object-cover rounded-xl">
        </div>

        <!-- Code de la salle -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-3">
          <p class="text-green-600 text-xs mb-1">{{ t().roomCode }}</p>
          <p class="text-4xl font-bold text-green-800 tracking-[0.25em]">{{ code() }}</p>
        </div>

        <!-- Copier le code -->
        <div class="flex justify-center mb-5">
          <button (click)="copyLink()"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl
                         border-2 border-green-200 text-green-600 bg-green-50
                         active:bg-green-100 transition-colors select-none text-sm font-semibold">
            @if (copied()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ t().codeCopied }}</span>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <span>{{ t().copyCode }}</span>
            }
          </button>
        </div>

        <!-- Liste des joueurs -->
        <div class="mb-5">
          <h3 class="text-green-700 font-semibold text-sm mb-2">
            {{ t().players }} ({{ players().length }}) :
          </h3>
          <div class="flex flex-col gap-1.5">
            @for (p of players(); track p.id) {
              <div class="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                <span class="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span class="text-gray-700 text-sm flex-1">{{ p.name }}</span>
                @if (p.id === room()?.host_id) {
                  <span class="text-xs text-green-500 font-medium">Host</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Durée (host uniquement) -->
        @if (isHost()) {
          <div class="mb-5">
            <label class="block text-green-700 font-semibold text-sm mb-2">
              {{ t().collectionDuration }}
            </label>
            <div class="flex gap-2 justify-center">
              @for (d of [4, 5, 6, 7]; track d) {
                <button
                  (click)="setDuration(d)"
                  [class]="duration() === d
                    ? 'bg-green-500 text-white shadow-md'
                    : 'border-2 border-green-200 text-green-600 hover:bg-green-50'"
                  class="w-14 h-12 rounded-xl font-bold text-sm transition-all select-none">
                  {{ d }}s
                </button>
              }
            </div>
          </div>

          <button
            (click)="startGame()"
            [disabled]="players().length < 1 || starting()"
            class="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40
                   text-white font-bold py-4 rounded-xl text-lg transition-colors select-none">
            {{ starting() ? t().starting : t().startGame }}
          </button>
        } @else {
          <div class="text-center text-green-500 text-sm animate-pulse py-3">
            {{ t().waitingForHost }}
          </div>
        }

      </div>

      <button (click)="router.navigate(['/lobby'])"
              class="mt-5 text-green-500 text-sm hover:text-green-700">
        {{ t().leave }}
      </button>
    </div>
  `,
})
export class RoomComponent implements OnInit, OnDestroy {
  readonly router = inject(Router);
  private route    = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  readonly i18n    = inject(I18nService);
  readonly t       = this.i18n.t;

  code     = signal('');
  room     = signal<any>(null);
  players  = computed(() => this.room()?.players ?? []);
  duration = signal(5);
  starting = signal(false);
  copied   = signal(false);
  isHost   = computed(() => this.room()?.host_id === getPlayerId());

  private channel: RealtimeChannel | null = null;
  private copyTimer: any = null;

  async ngOnInit() {
    const c = this.route.snapshot.paramMap.get('code') ?? '';
    this.code.set(c);
    await this.loadRoom(c);
    this.subscribeRoom(c);
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }

  async copyLink() {
    await navigator.clipboard.writeText(this.code());
    this.copied.set(true);
    this.copyTimer = setTimeout(() => this.copied.set(false), 2000);
  }

  async loadRoom(c: string) {
    const { data } = await this.supabase.client
      .from('rooms').select('*').eq('code', c).single();
    if (data) {
      this.room.set(data);
      this.duration.set(data['duration'] ?? 5);
      this.checkState(data);
    }
  }

  subscribeRoom(c: string) {
    this.channel = this.supabase.client
      .channel(`room-${c}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rooms',
        filter: `code=eq.${c}`,
      }, ({ new: r }) => {
        this.room.set(r);
        this.duration.set(r['duration'] ?? 5);
        this.checkState(r);
      })
      .subscribe();
  }

  checkState(r: any) {
    const s = r['state'];
    if (s === 'collecting') this.router.navigate(['/collect', r['code']]);
    if (s === 'battling')   this.router.navigate(['/battle',  r['code']]);
    if (s === 'results')    this.router.navigate(['/results', r['code']]);
  }

  async setDuration(d: number) {
    this.duration.set(d);
    await this.supabase.client
      .from('rooms').update({ duration: d }).eq('code', this.code());
  }

  async startGame() {
    this.starting.set(true);
    await this.supabase.client.from('rooms').update({
      state: 'collecting',
      started_at: Date.now() + 3000,
      duration: this.duration(),
      battle_data: null,
    }).eq('code', this.code());
  }
}
