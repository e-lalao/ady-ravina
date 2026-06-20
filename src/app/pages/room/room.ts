import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { getPlayerId } from '../../models/game.models';

@Component({
  selector: 'app-room',
  standalone: true,
  template: `
    <div class="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-7 w-full max-w-sm border border-green-100">

        <div class="flex justify-center mb-5">
          <img src="/accueil-Ady-ravina.png" alt="Ady Ravina"
               class="w-full max-h-36 object-cover rounded-xl">
        </div>

        <!-- Code de la salle -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-3">
          <p class="text-green-600 text-xs mb-1">Teny miafinan\'ny vondrona</p>
          <p class="text-4xl font-bold text-green-800 tracking-[0.25em]">{{ code() }}</p>
        </div>

        <!-- Boutons de partage -->
        <div class="flex gap-2 mb-5">
          <!-- WhatsApp -->
          <a [href]="whatsappUrl()" target="_blank" rel="noopener"
             class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    bg-[#25d366] text-white text-sm font-bold select-none no-underline
                    active:opacity-80">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          <!-- Messenger -->
          <a [href]="messengerUrl()" target="_blank" rel="noopener"
             class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    bg-[#0084ff] text-white text-sm font-bold select-none no-underline
                    active:opacity-80">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 shrink-0">
              <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
            </svg>
            <span>Messenger</span>
          </a>

          <!-- Copier le lien -->
          <button (click)="copyLink()"
                  class="flex items-center justify-center w-11 rounded-xl
                         border-2 border-green-200 text-green-600 bg-green-50
                         active:bg-green-100 transition-colors select-none"
                  [title]="copied() ? 'Voadika!' : 'Copier le lien'">
            @if (copied()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            }
          </button>
        </div>

        <!-- Liste des joueurs -->
        <div class="mb-5">
          <h3 class="text-green-700 font-semibold text-sm mb-2">
            Mpilalao ({{ players().length }}) :
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
              Faharetan'ny angon-dravina :
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
            {{ starting() ? 'Manomboka...' : 'Hanangona' }}
          </button>
        } @else {
          <div class="text-center text-green-500 text-sm animate-pulse py-3">
            Miandry ny tompon'ny vondrona...
          </div>
        }

      </div>

      <button (click)="router.navigate(['/lobby'])"
              class="mt-5 text-green-500 text-sm hover:text-green-700">
        ← Hiala
      </button>
    </div>
  `,
})
export class RoomComponent implements OnInit, OnDestroy {
  readonly router = inject(Router);
  private route    = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);

  code     = signal('');
  room     = signal<any>(null);
  players  = computed(() => this.room()?.players ?? []);
  duration = signal(5);
  starting = signal(false);
  copied   = signal(false);
  isHost   = computed(() => this.room()?.host_id === getPlayerId());

  joinUrl = computed(() => `${window.location.origin}/join/${this.code()}`);

  whatsappUrl = computed(() => {
    const msg = `Andao hampiady ravina! Tsindrio ity rohy ity mba hiditra: ${this.joinUrl()}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  });

  messengerUrl = computed(() =>
    `fb-messenger://share?link=${encodeURIComponent(this.joinUrl())}`
  );

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
      started_at: Date.now(),
      duration: this.duration(),
      battle_data: null,
    }).eq('code', this.code());
  }
}
