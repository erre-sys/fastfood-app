import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-2 z-[70] mx-auto flex w-full max-w-md flex-col gap-2 px-3"
    >
      <div
        *ngFor="let t of svc.toasts()"
        class="pointer-events-auto flex items-center justify-between rounded-lg border px-3 py-2 shadow"
        [ngClass]="{
          'bg-white border-slate-200 text-slate-800':
            !t.type || t.type === 'info',
          'bg-emerald-50 border-emerald-200 text-emerald-800':
            t.type === 'success',
          'bg-rose-50 border-rose-200 text-rose-800': t.type === 'error'
        }"
      >
        <span class="text-sm">{{ t.msg }}</span>
        <button class="rounded px-2 text-xs" (click)="svc.dismiss(t.id)">
          Cerrar
        </button>
      </div>
    </div>
  `,
})
export class ToastCenterComponent {
  constructor(public svc: ToastService) {}
}
