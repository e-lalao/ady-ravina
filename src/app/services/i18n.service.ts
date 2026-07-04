import { Injectable, signal, computed } from '@angular/core';
import { TRANSLATIONS, Lang } from '../i18n/translations';

export type { Lang };

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(
    (localStorage.getItem('ady-lang') as Lang) ?? 'mg'
  );

  readonly t = computed(() => TRANSLATIONS[this.lang()]);

  setLang(l: Lang) {
    this.lang.set(l);
    localStorage.setItem('ady-lang', l);
  }
}
