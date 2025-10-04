import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; msg: string; type?: 'info'|'success'|'error'; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  toasts = signal<Toast[]>([]);

  push(msg: string, type: Toast['type']='info', ms=3000){
    const t = { id: ++this.seq, msg, type };
    this.toasts.update(a => [t, ...a]);
    setTimeout(()=> this.dismiss(t.id), ms);
  }
  dismiss(id: number){ this.toasts.update(a => a.filter(t => t.id !== id)); }
}
