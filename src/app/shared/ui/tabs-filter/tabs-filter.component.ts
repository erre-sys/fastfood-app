// tabs-filter.component.ts
import { Component, EventEmitter, Input, Output, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

export type TabKey = string;
export type TabsTone = 'brand' | 'success' | 'warn' | 'danger' | 'info';

export interface TabsItem {
  key: TabKey;
  label: string;
  count?: number;
  disabled?: boolean;
  tone?: TabsTone;    // ← nuevo
}

@Component({
  selector: 'app-tabs-filter',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './tabs-filter.component.html',
})
export class TabsFilterComponent {
  @Input() items: TabsItem[] = [
    { key:'all', label:'Todos',    tone:'brand' },
    { key:'active', label:'Activos',  tone:'success' },
    { key:'inactive', label:'Inactivos', tone:'warn' },
  ];

  @Input() active: TabKey = 'all';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() autoActivate = true;

  @Output() activeChange = new EventEmitter<TabKey>();
  @ViewChildren('tabBtn') private tabBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  trackByKey = (_: number, t: TabsItem) => t.key;

  /** Mapea el tono a la variable CSS */
  colorForTone(t?: TabsTone): string {
    switch (t) {
      case 'success': return 'rgb(var(--success-rgb))';
      case 'warn':    return 'rgb(var(--warning-rgb))';
      case 'danger':  return 'rgb(var(--danger-rgb))';
      case 'info':    return 'rgb(var(--info-rgb))';
      case 'brand':
      default:        return 'rgb(var(--brand-rgb))';
    }
  }

  setTab(key: TabKey, focus = false) {
    if (this.active === key) return;
    this.active = key;
    this.activeChange.emit(key);
    if (focus) this.focusActive();
  }

  onKeydown(e: KeyboardEvent) {
    const list = this.items.filter(i => !i.disabled);
    const idx = Math.max(0, list.findIndex(i => i.key === this.active));
    const prevIdx = (idx - 1 + list.length) % list.length;
    const nextIdx = (idx + 1) % list.length;

    let target: TabsItem | null = null;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':   target = list[prevIdx]; break;
      case 'ArrowRight':
      case 'ArrowDown': target = list[nextIdx]; break;
      case 'Home':      target = list[0]; break;
      case 'End':       target = list[list.length - 1]; break;
      case 'Enter':
      case ' ':
        if (!this.autoActivate) this.setTab(this.active);
        return;
      default: return;
    }

    e.preventDefault();
    if (!target) return;

    if (this.autoActivate) this.setTab(target.key, true);
    else this.tabBtns.get(this.items.findIndex(i => i.key === target!.key))?.nativeElement.focus();
  }

  private focusActive() {
    this.tabBtns.get(this.items.findIndex(i => i.key === this.active))?.nativeElement.focus();
  }
}
