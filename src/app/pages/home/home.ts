import { Component, signal, computed, inject, effect } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';
import { SupabaseService } from '../../services/supabase.service';
import { I18nService } from '../../services/i18n.service';

const SEO_BY_LANG: Record<'mg' | 'fr' | 'en', { title: string; description: string }> = {
  mg: {
    title: "Ady Ravina – Kilalao fanaon'ny ankizy malagasy an-tserasera | e-lalao",
    description: "Ady Ravina: milalao an-tserasera miaraka amin'ny namana ny kilalao fanaon'ny ankizy malagasy. Mamorona vondrona, manasà ny namanao ary manangona ravina mba handresy. Kilalao maimaim-poana nataon'e-lalao.",
  },
  fr: {
    title: 'Ady Ravina – Le jeu traditionnel malgache de bataille de feuilles en ligne | e-lalao',
    description: "Ady Ravina : jouez en ligne, entre amis, au jeu traditionnel malgache de bataille de feuilles (ravina). Créez une partie, invitez vos proches et collectez des feuilles pour gagner. Un jeu gratuit signé e-lalao pour valoriser la culture malgache.",
  },
  en: {
    title: 'Ady Ravina – The Traditional Malagasy Leaf-Battle Game Online | e-lalao',
    description: 'Ady Ravina: play the traditional Malagasy leaf-battle game online with friends. Create a room, invite your friends and collect leaves to win. A free game by e-lalao celebrating Malagasy culture.',
  },
};


@Component({
  selector: 'app-home',
  standalone: true,
  styles: [`
    :host { display: block; }

    /* ═══════════════════════════════════ SPLASH ═══════════════════════════════════ */
    .splash-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, #bbf7d0 0%, transparent 60%),
        linear-gradient(170deg, #f0fdf4 0%, #86efac 30%, #4ade80 60%, #16a34a 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 1.2rem; cursor: pointer; user-select: none;
    }
    .splash-logo {
      width: clamp(100px, 30vw, 160px); height: clamp(100px, 30vw, 160px);
      border-radius: 50%; object-fit: cover;
      box-shadow: 0 12px 40px rgba(0,0,0,.18);
      animation: splashPulse 2s ease-in-out infinite;
    }
    .splash-title {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(2rem, 8vw, 3.5rem); color: #fff;
      text-shadow: 0 4px 16px rgba(0,0,0,.15);
    }
    .splash-tap {
      margin: 0; font-family: 'Nunito', sans-serif; font-weight: 700;
      font-size: clamp(.95rem, 3vw, 1.2rem); color: rgba(255,255,255,.8);
      animation: splashBlink 1.4s ease-in-out infinite;
    }
    .splash-lang {
      position: absolute; top: 1.2rem; right: 1.2rem;
      display: flex; gap: .4rem; z-index: 10;
    }
    .splash-lang-btn {
      background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.4);
      border-radius: 1rem; padding: .25rem .7rem;
      font-family: 'Fredoka One', cursive; font-size: .9rem;
      color: rgba(255,255,255,.85); cursor: pointer; transition: all .2s;
    }
    .splash-lang-btn.active {
      background: rgba(255,255,255,.92); color: #16a34a;
      border-color: rgba(255,255,255,.9);
    }
    .splash-lang-btn:not(.active):hover { background: rgba(255,255,255,.3); }
    @keyframes splashPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
    @keyframes splashBlink { 0%,100%{opacity:1;} 50%{opacity:.4;} }

    /* ═══════════════════════════════════ WRAPPER ══════════════════════════════════ */
    .home-wrapper { display: flex; flex-direction: column; }
    .home-wrapper.hidden { display: none; }

    /* ═══════════════════════════════════ HERO ═════════════════════════════════════ */
    .home {
      min-height: 100dvh;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, #bbf7d0 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 110%, #86efac 0%, transparent 55%),
        linear-gradient(170deg, #f0fdf4 0%, #a3e6c1 30%, #4ade80 60%, #16a34a 100%);
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem clamp(1rem, 5vw, 3rem); box-sizing: border-box;
    }

    /* Nav */
    .top-nav {
      position: absolute; top: 1rem; right: clamp(1rem, 4vw, 2.5rem);
      display: flex; gap: .5rem; z-index: 30;
    }
    .nav-link {
      font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .85rem;
      color: rgba(255,255,255,.85); background: rgba(255,255,255,.12);
      border: 1.5px solid rgba(255,255,255,.25); border-radius: 2rem;
      padding: .35rem .85rem; cursor: pointer; transition: all .2s ease; white-space: nowrap;
    }
    .nav-link:hover { background: rgba(255,255,255,.25); color: #fff; border-color: rgba(255,255,255,.5); }

    /* Clouds */
    .cloud { position:absolute; background:rgba(255,255,255,.55); border-radius:50px; filter:blur(1px); }
    .cloud::before,.cloud::after { content:''; position:absolute; background:inherit; border-radius:50%; }
    .cloud-1 { width:180px;height:50px;top:8%;left:-20px;animation:drift 18s linear infinite; }
    .cloud-1::before{width:90px;height:70px;top:-35px;left:20px;}
    .cloud-1::after{width:60px;height:55px;top:-25px;left:80px;}
    .cloud-2 { width:140px;height:40px;top:18%;right:-30px;animation:drift 24s linear infinite reverse;opacity:.45; }
    .cloud-2::before{width:70px;height:60px;top:-30px;left:15px;}
    .cloud-2::after{width:50px;height:45px;top:-20px;left:65px;}
    .cloud-3 { width:220px;height:55px;bottom:12%;left:5%;animation:drift 30s linear infinite;opacity:.35; }
    .cloud-3::before{width:110px;height:80px;top:-42px;left:25px;}
    .cloud-3::after{width:75px;height:65px;top:-32px;left:110px;}

    /* Confetti */
    .confetti{position:absolute;pointer-events:none;animation:floatIcon var(--dur,5s) ease-in-out var(--delay,0s) infinite;font-size:var(--size,1.4rem);opacity:.75;}
    .c1{--dur:6s;--delay:0s;--size:1.8rem;top:10%;left:8%;color:#fbbf24;}
    .c2{--dur:8s;--delay:1s;--size:1.5rem;top:6%;left:30%;color:#f472b6;}
    .c3{--dur:5s;--delay:2s;--size:1.2rem;top:12%;right:25%;color:#fbbf24;}
    .c4{--dur:7s;--delay:.5s;--size:1.6rem;top:5%;right:10%;color:#a78bfa;}
    .c5{--dur:9s;--delay:3s;--size:1rem;bottom:30%;left:12%;color:#fbbf24;}
    .c6{--dur:6s;--delay:1.5s;--size:1.3rem;bottom:22%;right:8%;color:#f472b6;}
    .c7{--dur:7s;--delay:4s;--size:1.1rem;bottom:35%;left:40%;color:#a78bfa;}
    .c8{--dur:5s;--delay:2.5s;--size:1.4rem;top:55%;right:18%;color:#fbbf24;}

    /* Layout */
    .page-layout { position:relative;z-index:10;display:flex;align-items:center;gap:clamp(2rem,6vw,5rem);max-width:1100px;width:100%; }
    .left-col { flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:1.6rem;min-width:0; }
    .right-col { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;gap:.8rem; }

    /* Brand badge */
    .brand-badge {
      background:rgba(255,255,255,.92);backdrop-filter:blur(8px);
      border:1.5px solid rgba(255,255,255,.8);border-radius:1rem;
      padding:.3rem .6rem;box-shadow:0 4px 16px rgba(0,0,0,.1);
    }
    .brand-logo { height:44px;width:auto;display:block; }

    /* Title */
    .game-title {
      margin:0;line-height:1;font-family:'Fredoka One',cursive;
      font-size:clamp(1.8rem,5vw,3.2rem);letter-spacing:.02em;white-space:nowrap;
      background:linear-gradient(90deg,#fff 0%,#dcfce7 50%,#bbf7d0 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      filter:drop-shadow(0 3px 6px rgba(0,0,0,.15));
    }

    /* Speech bubble */
    .speech-bubble {
      position:relative;background:#fff;border-radius:1.5rem;padding:1.2rem 2rem;
      box-shadow:0 8px 0 rgba(22,163,74,.3),0 12px 32px rgba(0,0,0,.12);
      border:3px solid rgba(22,163,74,.2);
    }
    .bubble-tail {
      position:absolute;bottom:-22px;left:36px;
      border-left:18px solid transparent;border-right:8px solid transparent;
      border-top:22px solid #fff;filter:drop-shadow(0 4px 2px rgba(0,0,0,.08));
    }
    .question-text {
      margin:0;font-family:'Fredoka One',cursive;
      font-size:clamp(1.4rem,4.5vw,2.4rem);color:#16a34a;line-height:1.2;
    }

    /* Play buttons */
    .play-btns { display:flex;flex-direction:column;gap:.7rem;align-items:flex-start; }

    .play-btn {
      display:inline-flex;align-items:center;gap:.8rem;
      background:none;border:none;cursor:pointer;padding:0;margin-top:.5rem;
      transition:transform .15s ease;
    }
    .play-btn:hover { transform:translateY(-4px); }
    .play-btn:hover .play-circle { box-shadow:0 0 24px #16a34a,0 0 48px rgba(22,163,74,.4); }
    .play-btn:active { transform:translateY(1px); }

    .play-circle {
      width:56px;height:56px;background:linear-gradient(135deg,#22c55e,#16a34a);
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:1.2rem;color:#fff;
      box-shadow:0 4px 0 #15803d,0 6px 18px rgba(22,163,74,.5);
      flex-shrink:0;transition:box-shadow .15s ease;
    }
    .play-label {
      font-family:'Fredoka One',cursive;font-size:clamp(1.8rem,5vw,3rem);
      color:#fff;letter-spacing:.04em;text-shadow:0 3px 0 rgba(0,0,0,.15);
    }

    .multi-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);
      border-radius:2rem;padding:.5rem 1.4rem .5rem .8rem;cursor:pointer;
      transition:all .15s ease;
    }
    .multi-btn:hover { background:rgba(255,255,255,.3);transform:translateY(-2px); }
    .multi-icon { font-size:1.3rem; }
    .multi-label {
      font-family:'Fredoka One',cursive;font-size:clamp(1rem,3vw,1.4rem);
      color:rgba(255,255,255,.9);letter-spacing:.03em;
    }

    /* Mute */
    .mute-home-btn {
      font-size:1.3rem;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.35);
      border-radius:50%;width:40px;height:40px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      transition:background .2s;margin-top:-.4rem;
    }
    .mute-home-btn:hover { background:rgba(255,255,255,.35); }

    /* Dots */
    .dots { display:flex;gap:.5rem; }
    .dot { width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.5); }
    .dot.active { background:#fbbf24;border-color:#fbbf24;box-shadow:0 0 8px #fbbf24; }

    /* Image frame */
    .image-frame { position:relative;animation:bob 4s ease-in-out infinite; }
    .frame-glow { position:absolute;inset:-20px;background:radial-gradient(ellipse,rgba(134,239,172,.6) 0%,transparent 70%);border-radius:50%;z-index:0;animation:glowPulse 3s ease-in-out infinite; }
    .illustration { position:relative;z-index:1;width:clamp(180px,38vw,440px);height:auto;border-radius:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2),0 0 0 6px rgba(255,255,255,.3),0 0 0 12px rgba(255,255,255,.1);display:block; }
    .frame-badge { position:absolute;top:-16px;right:-16px;z-index:2;width:52px;height:52px;background:linear-gradient(135deg,#bbf7d0,#4ade80);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 4px 12px rgba(74,222,128,.5);animation:spin 8s linear infinite; }

    @keyframes hilalaoJump {
      0%{transform:scale(1) rotate(0deg);filter:brightness(1);}
      20%{transform:scale(1.12) rotate(-4deg);filter:brightness(1.3);}
      45%{transform:scale(1.18) rotate(3deg);filter:brightness(1.5) drop-shadow(0 0 30px #4ade80);}
      70%{transform:scale(1.1) rotate(-2deg);filter:brightness(1.2);}
      100%{transform:scale(1) rotate(0deg);filter:brightness(1);}
    }
    .illustration.jump-anim { animation:hilalaoJump .75s ease forwards; }

    /* Scroll hint */
    .scroll-hint {
      position:absolute;bottom:1.4rem;left:50%;transform:translateX(-50%);
      background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.35);
      border-radius:50%;width:44px;height:44px;display:flex;align-items:center;
      justify-content:center;cursor:pointer;animation:bounceDown 2s ease-in-out infinite;
      z-index:20;transition:background .2s;
    }
    .scroll-hint:hover { background:rgba(255,255,255,.3); }
    .scroll-arrow { font-size:1.3rem;color:#fff;line-height:1; }

    /* Keyframes */
    @keyframes drift{from{transform:translateX(-120px);}to{transform:translateX(calc(100vw + 120px));}}
    @keyframes floatIcon{0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-14px) rotate(5deg);}66%{transform:translateY(6px) rotate(-3deg);}}
    @keyframes bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
    @keyframes glowPulse{0%,100%{opacity:.6;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes bounceDown{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(6px);}}

    /* Visitors badge */
    .visitors-badge {
      display: inline-flex; align-items: center; gap: .5rem;
      background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.3);
      border-radius: 2rem; padding: .4rem 1rem;
      backdrop-filter: blur(6px);
    }
    .visitors-icon {
      width: 16px; height: 16px; flex-shrink: 0;
      color: rgba(255,255,255,.85); display: block;
    }
    .visitors-count {
      font-family: 'Fredoka One', cursive; font-size: 1.05rem; color: #fff;
      letter-spacing: .04em;
    }
    .visitors-label {
      font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .78rem;
      color: rgba(255,255,255,.75); text-transform: uppercase; letter-spacing: .08em;
    }

    /* ═══════════════════════════════════ RULES ════════════════════════════════════ */
    .rules-section {
      background: linear-gradient(180deg, #f0fdf4 0%, #fff 100%);
      padding: clamp(3rem,8vw,5rem) clamp(1rem,5vw,3rem);
      display: flex; flex-direction: column; align-items: center; gap: 2.5rem;
    }
    .rules-header { text-align: center; display: flex; flex-direction: column; gap: .5rem; align-items: center; }
    .rules-title {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(1.8rem, 5vw, 2.8rem); color: #16a34a;
      line-height: 1.1;
    }
    .rules-sub {
      margin: 0; font-family: 'Nunito', sans-serif; font-size: clamp(.9rem,2vw,1.1rem);
      color: #4b7a5a; font-style: italic;
    }

    .rules-cards { display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px; width: 100%; }
    .rule-card {
      background: #fff; border: 2px solid #bbf7d0; border-radius: 1.5rem;
      padding: clamp(1.2rem,3vw,1.8rem); display: flex; gap: 1.2rem; align-items: flex-start;
      box-shadow: 0 4px 18px rgba(22,163,74,.08);
      transition: border-color .2s, box-shadow .2s;
    }
    .rule-card:hover { border-color: #4ade80; box-shadow: 0 8px 28px rgba(22,163,74,.15); }
    .rule-num {
      flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #4ade80, #16a34a);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Fredoka One', cursive; font-size: 1.3rem; color: #fff;
      box-shadow: 0 3px 0 #15803d;
    }
    .rule-content { display: flex; flex-direction: column; gap: .5rem; flex: 1; min-width: 0; }
    .rule-q {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(1rem, 2.5vw, 1.2rem); color: #16a34a;
    }
    .rule-a {
      margin: 0; font-family: 'Nunito', sans-serif;
      font-size: clamp(.88rem, 2vw, 1rem); color: #374151; line-height: 1.7;
    }

    /* ═══════════════════════════════════ ABOUT ════════════════════════════════════ */
    .about-section {
      background:linear-gradient(180deg,#0a2e1a 0%,#061510 100%);
      padding:clamp(3rem,8vw,5rem) clamp(1rem,5vw,3rem);
      display:flex;flex-direction:column;align-items:center;gap:2.5rem;
    }
    .lang-toggle {
      display:flex;gap:.5rem;background:rgba(22,163,74,.08);
      border:1.5px solid rgba(22,163,74,.2);border-radius:3rem;padding:.3rem;
    }
    .lang-btn {
      font-family:'Fredoka One',cursive;font-size:.95rem;letter-spacing:.08em;
      color:#6b8f72;background:transparent;border:none;
      border-radius:2rem;padding:.35rem .9rem;cursor:pointer;transition:all .2s ease;
    }
    .lang-btn.active { color:#fff;background:#16a34a;box-shadow:0 2px 8px rgba(22,163,74,.4); }
    .lang-btn:not(.active):hover { color:#16a34a; }

    .about-card {
      background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);
      border-radius:2rem;padding:clamp(1.4rem,4vw,2.2rem);
      display:flex;flex-direction:column;gap:1rem;
      max-width:560px;width:100%;
      transition:border-color .3s,background .3s;
    }
    .about-card:hover { background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22); }
    .card-icon { font-size:2.4rem;line-height:1; }
    .card-title { margin:0;font-family:'Fredoka One',cursive;font-size:clamp(1.3rem,3vw,1.8rem);color:#4ade80;line-height:1.2; }
    .card-text { margin:0;font-family:'Nunito',sans-serif;font-size:clamp(.9rem,2vw,1.05rem);color:rgba(255,255,255,.8);line-height:1.7; }

    .contact-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      font-family:'Fredoka One',cursive;font-size:1.1rem;color:#0a2e1a;
      background:#4ade80;text-decoration:none;border-radius:2rem;padding:.65rem 1.5rem;
      box-shadow:0 4px 0 #16a34a,0 6px 18px rgba(74,222,128,.3);
      transition:transform .15s ease,box-shadow .15s ease;align-self:flex-start;margin-top:.3rem;
    }
    .contact-btn:hover { transform:translateY(-2px);box-shadow:0 6px 0 #16a34a,0 10px 22px rgba(74,222,128,.4); }
    .contact-hint { margin:0;font-family:'Nunito',sans-serif;font-size:.82rem;color:rgba(255,255,255,.45);font-style:italic; }
    .visit-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      font-family:'Fredoka One',cursive;font-size:1.05rem;color:#4ade80;
      background:rgba(74,222,128,.1);border:1.5px solid rgba(74,222,128,.35);
      text-decoration:none;border-radius:2rem;padding:.6rem 1.4rem;
      transition:all .15s ease;align-self:flex-start;
    }
    .visit-btn:hover { background:rgba(74,222,128,.2);border-color:rgba(74,222,128,.6);color:#86efac;transform:translateY(-1px); }
    .visit-icon { width:16px;height:16px;flex-shrink:0; }

    /* ═══════════════════════════════════ FOOTER ═══════════════════════════════════ */
    .site-footer {
      background:#030a05;padding:2rem 1.5rem;
      display:flex;flex-direction:column;align-items:center;gap:.6rem;
    }
    .footer-logo { height:36px;width:auto;opacity:.8;filter:brightness(1.2); }
    .footer-line { margin:0;font-family:'Nunito',sans-serif;font-size:.9rem;color:rgba(255,255,255,.45);text-align:center;font-style:italic; }
    .footer-copy { margin:0;font-family:'Fredoka One',cursive;font-size:.85rem;color:rgba(255,255,255,.25);letter-spacing:.06em; }

    /* ═══════════════════════════════════ RESPONSIVE ═══════════════════════════════ */
    @media(max-width:750px){
      .home{padding:1.5rem 1rem;align-items:flex-start;padding-top:2rem;}
      .page-layout{flex-direction:column;align-items:center;gap:1.2rem;}
      .left-col{align-items:center;gap:1rem;order:1;}
      .right-col{order:2;}
      .bubble-tail{left:50%;transform:translateX(-50%);}
      .speech-bubble{width:100%;box-sizing:border-box;padding:.8rem 1.2rem;}
      .cloud-1,.cloud-2,.cloud-3{display:none;}
      .top-nav{left:1rem;right:1rem;justify-content:space-between;}
      .nav-link{font-size:.78rem;padding:.3rem .7rem;}
    }
    @media(max-width:480px){
      .home{padding:1rem .8rem;padding-top:1.5rem;}
      .game-title{font-size:clamp(1.5rem,8vw,2.2rem);}
      .question-text{font-size:clamp(1.1rem,6vw,1.8rem);}
      .speech-bubble{padding:.7rem 1rem;border-radius:1rem;}
      .play-circle{width:44px;height:44px;font-size:1rem;}
      .play-label{font-size:clamp(1.4rem,8vw,2rem);}
      .illustration{width:min(80vw,280px);}
      .frame-badge{width:38px;height:38px;font-size:1.1rem;top:-10px;right:-10px;}
      .confetti{display:none;}
      .left-col{gap:.8rem;}
    }
  `],
  template: `
    <!-- ══════════════════ SPLASH ══════════════════ -->
    @if (!started()) {
      <div class="splash-overlay" (click)="onStart()">
        <div class="splash-lang" (click)="$event.stopPropagation()">
          <button class="splash-lang-btn" [class.active]="i18n.lang() === 'mg'" (click)="i18n.setLang('mg')">MG</button>
          <button class="splash-lang-btn" [class.active]="i18n.lang() === 'fr'" (click)="i18n.setLang('fr')">FR</button>
          <button class="splash-lang-btn" [class.active]="i18n.lang() === 'en'" (click)="i18n.setLang('en')">EN</button>
        </div>
        <img src="accueil-Ady-ravina.webp" alt="Ady Ravina - jeu traditionnel malgache de bataille de feuilles" class="splash-logo" />
        <p class="splash-title">Ady Ravina</p>
        <p class="splash-tap">{{ t().splashTap }}</p>
      </div>
    }

    <div class="home-wrapper" [class.hidden]="!started()">

      <!-- ══════════════════ HERO ══════════════════ -->
      <main class="home">

        <nav class="top-nav">
          <button class="nav-link" (click)="scrollToRules()">{{ t().navRules }}</button>
          <button class="nav-link" (click)="scrollToAbout()">{{ t().navAbout }}</button>
        </nav>

        <!-- Clouds -->
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>

        <!-- Confetti -->
        <div class="confetti c1">🌿</div>
        <div class="confetti c2">★</div>
        <div class="confetti c3">🍃</div>
        <div class="confetti c4">✦</div>
        <div class="confetti c5">🌿</div>
        <div class="confetti c6">★</div>
        <div class="confetti c7">🍃</div>
        <div class="confetti c8">✦</div>

        <div class="page-layout">

          <!-- ── Gauche : texte ── -->
          <div class="left-col">
            <div class="brand-badge">
              <img src="logo-de-e-lalao.webp" alt="Logo e-lalao" class="brand-logo" />
            </div>

            <h1 class="game-title">Ady Ravina</h1>

            <div class="speech-bubble">
              <p class="question-text" [innerHTML]="t().speechBubble"></p>
              <div class="bubble-tail"></div>
            </div>

            <div class="play-btns">
              <button class="play-btn" (click)="onHilalao()">
                <span class="play-circle">▶</span>
                <span class="play-label">{{ t().playBtn }}</span>
              </button>
              <button class="multi-btn" (click)="scrollToRules()">
                <span class="multi-icon">📖</span>
                <span class="multi-label">{{ t().rulesBtn }}</span>
              </button>
            </div>

            <button class="mute-home-btn"
                    (click)="audio.toggleMute()"
                    [title]="audio.muted() ? 'Rendre le son' : 'Couper le son'">
              {{ audio.muted() ? '🔇' : '🔊' }}
            </button>

            <div class="dots">
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>

          </div>

          <!-- ── Droite : grande image ── -->
          <div class="right-col">
            <div class="image-frame">
              <div class="frame-glow"></div>
              <img
                src="accueil-Ady-ravina.webp"
                alt="Illustration du jeu Ady Ravina, bataille de feuilles entre enfants malgaches"
                class="illustration"
                [class.jump-anim]="imageAnim()"
              />
              <div class="frame-badge">🌿</div>
            </div>

            @if (visitors() !== null) {
              <div class="visitors-badge">
                <svg class="visitors-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="visitors-count">{{ visitors()!.toLocaleString() }}</span>
                <span class="visitors-label">{{ t().visitorsLabel }}</span>
              </div>
            }
          </div>

        </div>

        <!-- Scroll arrow -->
        <button class="scroll-hint" (click)="scrollToRules()" aria-label="En savoir plus">
          <span class="scroll-arrow">↓</span>
        </button>
      </main>

      <!-- ══════════════════ RULES ══════════════════ -->
      <section class="rules-section" id="fitsipika">
        <div class="rules-header">
          <div class="lang-toggle">
            <button class="lang-btn" [class.active]="i18n.lang() === 'mg'" (click)="i18n.setLang('mg')">MG</button>
            <button class="lang-btn" [class.active]="i18n.lang() === 'fr'" (click)="i18n.setLang('fr')">FR</button>
            <button class="lang-btn" [class.active]="i18n.lang() === 'en'" (click)="i18n.setLang('en')">EN</button>
          </div>
          <h2 class="rules-title">🌿 {{ t().rulesTitle }}</h2>
          <p class="rules-sub">{{ t().rulesSub }}</p>
        </div>

        <div class="rules-cards">
          <div class="rule-card">
            <div class="rule-num">1</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r1q }}</p>
              <p class="rule-a">{{ t().r1a }}</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-num">2</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r2q }}</p>
              <p class="rule-a">{{ t().r2a }}</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-num">3</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r3q }}</p>
              <p class="rule-a">{{ t().r3a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════ ABOUT (e-lalao only) ══════════════════ -->
      <section class="about-section" id="apropos">
        <div class="about-card">
          <div class="card-icon">🌿</div>
          <h2 class="card-title">{{ t().aboutTitle }}</h2>
          <p class="card-text">{{ t().aboutText }}</p>
          <a class="contact-btn"
             href="mailto:fanomezanasarobidy2003@gmail.com"
             target="_blank" rel="noopener">
            <span>✉️</span>
            <span>{{ t().contactBtn }}</span>
          </a>
          <a class="visit-btn"
             href="https://e-lalao.github.io/e-lalao/"
             target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="visit-icon">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            <span>{{ t().visitBtn }}</span>
          </a>
          <p class="contact-hint">{{ t().contactLabel }}</p>
        </div>
      </section>

      <!-- ══════════════════ FOOTER ══════════════════ -->
      <footer class="site-footer">
        <img src="logo-de-e-lalao.webp" alt="Logo e-lalao" class="footer-logo" />
        <p class="footer-line">{{ t().footerLine }}</p>
        <p class="footer-copy">© {{ year }} e-lalao</p>
      </footer>

    </div>
  `,
})
export class HomeComponent {
  private router   = inject(Router);
  private supabase = inject(SupabaseService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  readonly audio   = inject(AudioService);

  readonly i18n = inject(I18nService);
  readonly t    = this.i18n.t;

  started   = signal(false);
  imageAnim = signal(false);
  visitors  = signal<number | null>(null);
  readonly year = new Date().getFullYear();

  constructor() {
    effect(() => {
      const seo = SEO_BY_LANG[this.i18n.lang()];
      this.titleSvc.setTitle(seo.title);
      this.metaSvc.updateTag({ name: 'description', content: seo.description });
    });
  }

  async onStart() {
    this.started.set(true);
    this.audio.startBackground();
    try {
      const { data } = await this.supabase.client.rpc('increment_visitors');
      if (data != null) this.visitors.set(Number(data));
    } catch { /* silencieux si la table n'existe pas encore */ }
  }

  onHilalao() {
    this.audio.playWoueh();
    this.imageAnim.set(true);
    setTimeout(() => this.router.navigate(['/lobby']), 750);
  }

  scrollToRules() {
    document.getElementById('fitsipika')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToAbout() {
    document.getElementById('apropos')?.scrollIntoView({ behavior: 'smooth' });
  }
}
