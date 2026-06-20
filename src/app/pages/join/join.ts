import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { getPlayerId } from '../../models/game.models';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    :host { display: block; }
    .page {
      min-height: 100dvh;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, #bbf7d0 0%, transparent 60%),
        linear-gradient(170deg, #f0fdf4 0%, #a3e6c1 35%, #4ade80 65%, #16a34a 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; box-sizing: border-box;
    }
    .card {
      background: rgba(255,255,255,.96); border-radius: 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,.15); padding: 2.2rem 2rem;
      width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 1.6rem;
    }
    .logo { height: 48px; width: auto; display: block; margin: 0 auto; }
    .invite-label {
      margin: 0; text-align: center; font-family: 'Nunito', sans-serif;
      font-size: .9rem; color: #6b8f72; font-weight: 600;
    }
    .room-code-box {
      background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 1.2rem;
      padding: 1rem; text-align: center;
    }
    .room-code-hint { margin: 0 0 .3rem; font-family: 'Nunito', sans-serif; font-size: .78rem; color: #6b8f72; }
    .room-code {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: 2.4rem; color: #16a34a; letter-spacing: .25em;
    }
    .name-group { display: flex; flex-direction: column; gap: .6rem; }
    .name-label { font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .88rem; color: #374151; }
    .name-input {
      width: 100%; box-sizing: border-box; padding: .85rem 1rem;
      border: 2px solid #bbf7d0; border-radius: 1rem; font-size: 1rem;
      font-family: 'Nunito', sans-serif; font-weight: 600; color: #1a2e1a;
      outline: none; transition: border-color .2s;
    }
    .name-input:focus { border-color: #4ade80; }
    .name-input::placeholder { color: #a3c4a8; font-weight: 400; }
    .join-btn {
      width: 100%; padding: 1rem; border: none; border-radius: 1.2rem;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff; font-family: 'Fredoka One', cursive; font-size: 1.4rem;
      letter-spacing: .04em; cursor: pointer;
      box-shadow: 0 4px 0 #15803d, 0 6px 18px rgba(22,163,74,.4);
      transition: transform .1s, box-shadow .1s;
    }
    .join-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 0 #15803d, 0 10px 22px rgba(22,163,74,.4); }
    .join-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 2px 0 #15803d; }
    .join-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .error-msg {
      margin: 0; text-align: center; font-family: 'Nunito', sans-serif;
      font-size: .9rem; color: #dc2626; font-weight: 600;
      background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: .8rem; padding: .7rem;
    }
    .loading-msg {
      margin: 0; text-align: center; font-family: 'Nunito', sans-serif;
      font-size: .9rem; color: #6b8f72; animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.45;} }
  `],
  template: `
    <div class="page">
      <div class="card">
        <img src="/logo-de-e-lalao.png" alt="Ady Ravina" class="logo" />

        @if (loading()) {
          <p class="loading-msg">Mitady efitra...</p>
        } @else if (error()) {
          <p class="error-msg">{{ error() }}</p>
          <button class="join-btn" (click)="router.navigate(['/'])">← Hody</button>
        } @else {
          <p class="invite-label">Voasasatra handray anjara amin'ny</p>

          <div class="room-code-box">
            <p class="room-code-hint">Code ny vondrona</p>
            <p class="room-code">{{ roomCode }}</p>
          </div>

          <div class="name-group">
            <label class="name-label" for="nameInput">Ny anaranao :</label>
            <input
              id="nameInput"
              class="name-input"
              type="text"
              [(ngModel)]="playerName"
              placeholder="Ohatra: Rakoto"
              maxlength="20"
              (keydown.enter)="join()"
              autocomplete="off"
            />
          </div>

          <button
            class="join-btn"
            [disabled]="!playerName.trim() || joining()"
            (click)="join()">
            {{ joining() ? 'Miditra...' : 'Miditra ▶' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class JoinComponent implements OnInit {
  readonly router = inject(Router);
  private route   = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);

  roomCode   = '';
  playerName = '';
  loading    = signal(true);
  joining    = signal(false);
  error      = signal('');

  async ngOnInit() {
    this.roomCode = (this.route.snapshot.paramMap.get('code') ?? '').toUpperCase();

    const { data } = await this.supabase.client
      .from('rooms').select('state').eq('code', this.roomCode).single();

    this.loading.set(false);

    if (!data) {
      this.error.set('Tsy hita ity efitra ity. Manamarina ny teny miafina azafady.');
      return;
    }
    if (data['state'] !== 'waiting') {
      this.error.set('Efa nanomboka ny lalao. Teneno ny namanao hametraka code vaovao.');
    }
  }

  async join() {
    const name = this.playerName.trim();
    if (!name || this.joining()) return;
    this.joining.set(true);

    sessionStorage.setItem('playerName', name);

    const playerId = getPlayerId();

    // Ajouter le joueur dans la liste players du room
    const { data: room } = await this.supabase.client
      .from('rooms').select('players').eq('code', this.roomCode).single();

    if (room) {
      const players: any[] = room['players'] ?? [];
      const alreadyIn = players.some((p: any) => p.id === playerId);
      if (!alreadyIn) {
        players.push({ id: playerId, name });
        await this.supabase.client
          .from('rooms').update({ players }).eq('code', this.roomCode);
      }
    }

    this.router.navigate(['/room', this.roomCode]);
  }
}
