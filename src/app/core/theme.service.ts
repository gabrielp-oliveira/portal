import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly LS_KEY = 'portal-color-scheme';

  private darkSubject = new BehaviorSubject<boolean>(this.resolveInitial());

  isDark$ = this.darkSubject.asObservable();

  get isDark(): boolean {
    return this.darkSubject.value;
  }

  constructor() {
    this.apply(this.darkSubject.value);

    // Reage a mudanças na preferência do sistema operacional
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem(this.LS_KEY)) {
          this.darkSubject.next(e.matches);
          this.apply(e.matches);
        }
      });
  }

  private resolveInitial(): boolean {
    const saved = localStorage.getItem(this.LS_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle(): void {
    this.setDark(!this.darkSubject.value);
  }

  /** Chamado externamente (ex: subway settings) para sincronizar o tema. */
  setDark(dark: boolean): void {
    if (this.darkSubject.value === dark) return;
    this.darkSubject.next(dark);
    localStorage.setItem(this.LS_KEY, dark ? 'dark' : 'light');
    this.apply(dark);
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}
