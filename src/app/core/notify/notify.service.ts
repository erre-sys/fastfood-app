import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: string; type: ToastType; text: string; timeout?: number; }

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private _items = signal<Toast[]>([]);
  items = this._items.asReadonly();

  private genId() {
    return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }
  private push(t: Omit<Toast, 'id'>) {
    const toast: Toast = { id: this.genId(), timeout: 4000, ...t };
    this._items.update(arr => [...arr, toast]);
    if (toast.timeout && toast.timeout > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.timeout);
    }
  }

  dismiss(id: string) { this._items.update(arr => arr.filter(x => x.id !== id)); }

  success(text: string, timeout = 3000) { this.push({ type: 'success', text, timeout }); }
  error(text: string, timeout = 6000)   { this.push({ type: 'error', text, timeout }); }
  info(text: string, timeout = 4000)    { this.push({ type: 'info', text, timeout }); }
  warning(text: string, timeout = 5000) { this.push({ type: 'warning', text, timeout }); }
}
