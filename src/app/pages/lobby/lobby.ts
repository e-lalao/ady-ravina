import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import { SupabaseService } from '../../services/supabase.service';
import { I18nService } from '../../services/i18n.service';
import { generateRoomCode, getPlayerId } from '../../models/game.models';

type Phase = null | 'join' | 'creating';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-green-100">

        <div class="flex justify-center mb-4">
          <img src="accueil-Ady-ravina.webp" alt="Ady Ravina" class="h-16 object-contain">
        </div>

        <!-- Sélecteur de langue -->
        <div class="flex justify-center gap-2 mb-5">
          <button (click)="i18n.setLang('mg')"
                  [class]="i18n.lang() === 'mg'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'border border-green-300 text-green-600 hover:bg-green-50'"
                  class="px-3 py-1 rounded-xl text-xs font-bold transition-all select-none">MG</button>
          <button (click)="i18n.setLang('fr')"
                  [class]="i18n.lang() === 'fr'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'border border-green-300 text-green-600 hover:bg-green-50'"
                  class="px-3 py-1 rounded-xl text-xs font-bold transition-all select-none">FR</button>
          <button (click)="i18n.setLang('en')"
                  [class]="i18n.lang() === 'en'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'border border-green-300 text-green-600 hover:bg-green-50'"
                  class="px-3 py-1 rounded-xl text-xs font-bold transition-all select-none">EN</button>
        </div>

        <!-- STEP 1 : nom du joueur -->
        @if (phase() === null) {
          <div>
            <label class="block text-green-700 font-semibold mb-2 text-sm">{{ t().yourName }}</label>
            <input
              [(ngModel)]="playerName"
              type="text"
              [placeholder]="t().namePlaceholder"
              maxlength="20"
              class="w-full border-2 border-green-200 rounded-xl px-4 py-3 text-base
                     focus:outline-none focus:border-green-500 mb-5">

            <div class="flex flex-col gap-3">
              <button
                (click)="createRoom()"
                [disabled]="!playerName.trim()"
                class="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40
                       text-white font-bold py-4 rounded-xl text-base transition-colors select-none">
                {{ t().createRoom }}
              </button>
              <button
                (click)="phase.set('join')"
                [disabled]="!playerName.trim()"
                class="w-full border-2 border-green-400 text-green-600 hover:bg-green-50
                       disabled:opacity-40 font-bold py-4 rounded-xl text-base transition-colors select-none">
                {{ t().joinRoom }}
              </button>
            </div>
          </div>
        }

        <!-- STEP 2 : rejoindre -->
        @if (phase() === 'join') {
          <div>
            <button (click)="phase.set(null)" class="text-green-600 text-sm mb-4 flex items-center gap-1">
              {{ t().back }}
            </button>
            <label class="block text-green-700 font-semibold mb-2 text-sm">{{ t().roomCode }} :</label>
            <input
              [(ngModel)]="joinCode"
              type="text"
              placeholder="XXXXXX"
              maxlength="6"
              (input)="joinCode = joinCode.toUpperCase()"
              class="w-full border-2 border-green-200 rounded-xl px-4 py-3 text-2xl
                     text-center tracking-widest uppercase focus:outline-none focus:border-green-500 mb-3">

            @if (errorMsg()) {
              <p class="text-red-500 text-sm text-center mb-3">{{ errorMsg() }}</p>
            }

            <button
              (click)="joinRoomFn()"
              [disabled]="loading() || joinCode.length < 6"
              class="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40
                     text-white font-bold py-4 rounded-xl text-base transition-colors select-none">
              {{ loading() ? t().loading : t().joinBtn }}
            </button>
          </div>
        }

        <!-- creating spinner -->
        @if (phase() === 'creating') {
          <div class="text-center py-4 text-green-500 animate-pulse">{{ t().creating }}</div>
        }

      </div>

      <button (click)="router.navigate(['/'])"
              class="mt-5 text-green-500 text-sm hover:text-green-700">
        {{ t().backHome }}
      </button>
    </div>
  `,
})
export class LobbyComponent {
  readonly router = inject(Router);
  private audio = inject(AudioService);
  private supabase = inject(SupabaseService);
  readonly i18n = inject(I18nService);
  readonly t = this.i18n.t;

  playerName = '';
  joinCode = '';
  phase = signal<Phase>(null);
  loading = signal(false);
  errorMsg = signal('');

  async createRoom() {
    if (!this.playerName.trim()) return;
    this.phase.set('creating');
    this.errorMsg.set('');

    const code = generateRoomCode();
    const playerId = getPlayerId();
    sessionStorage.setItem('playerName', this.playerName.trim());

    const { error } = await this.supabase.client.from('rooms').insert({
      code,
      host_id: playerId,
      host_name: this.playerName.trim(),
      players: [{ id: playerId, name: this.playerName.trim() }],
      state: 'waiting',
      duration: 5,
      started_at: null,
    });

    if (error) {
      this.errorMsg.set(this.t().roomNotFound);
      this.phase.set(null);
      return;
    }

    this.router.navigate(['/room', code]);
  }

  async joinRoomFn() {
    if (this.joinCode.length < 6 || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const code = this.joinCode.toUpperCase();
    const { data, error } = await this.supabase.client
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      this.errorMsg.set(this.t().roomNotFound);
      this.loading.set(false);
      return;
    }
    if (data['state'] !== 'waiting') {
      this.errorMsg.set(this.t().gameAlreadyStarted);
      this.loading.set(false);
      return;
    }

    const playerId = getPlayerId();
    const players: any[] = [...(data['players'] || [])];
    if (!players.find((p) => p.id === playerId)) {
      players.push({ id: playerId, name: this.playerName.trim() });
      await this.supabase.client.from('rooms').update({ players }).eq('code', code);
    }

    sessionStorage.setItem('playerName', this.playerName.trim());
    this.router.navigate(['/room', code]);
  }
}
