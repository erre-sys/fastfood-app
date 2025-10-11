import { Injectable, Inject, signal, computed, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme';
  private readonly mql = window.matchMedia('(prefers-color-scheme: dark)');

  readonly mode = signal<Theme>(
    (localStorage.getItem(this.key) as Theme) || 'system'
  );
  readonly isDark = computed(
    () =>
      this.mode() === 'dark' || (this.mode() === 'system' && this.mql.matches)
  );

  constructor(@Inject(DOCUMENT) private doc: Document) {
    effect(() => this.apply(this.isDark()));
    this.mql.addEventListener('change', () => this.apply(this.isDark()));
  }

  set(mode: Theme) {
    localStorage.setItem(this.key, mode);
    this.mode.set(mode);
  }
  toggle() {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  private apply(dark: boolean) {
    const root = this.doc.documentElement;
    root.classList.toggle('dark', dark);
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }
}
