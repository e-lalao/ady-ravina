import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private bgMusic: HTMLAudioElement | null = null;
  private bgStarted = false;
  muted = signal(false);

  startBackground() {
    if (this.bgStarted) return;
    this.bgMusic = new Audio('sounds/music-background-ady-ravina.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.35;
    this.bgMusic.muted = this.muted();
    this.bgMusic.play().catch(() => {});
    this.bgStarted = true;
  }

  toggleMute() {
    const m = !this.muted();
    this.muted.set(m);
    if (this.bgMusic) this.bgMusic.muted = m;
  }

  playWoueh() {
    if (this.muted()) return;
    const a = new Audio('sounds/woueh.mp3');
    a.volume = 0.8;
    a.play().catch(() => {});
  }

  playHey() {
    if (this.muted()) return;
    const a = new Audio('sounds/hey.mp3');
    a.volume = 0.9;
    a.play().catch(() => {});
  }

  playClick() {
    if (this.muted()) return;
    const a = new Audio('sounds/click.mp3');
    a.volume = 0.5;
    a.play().catch(() => {});
  }

  setBackgroundVolume(v: number) {
    if (this.bgMusic) this.bgMusic.volume = v;
  }
}
