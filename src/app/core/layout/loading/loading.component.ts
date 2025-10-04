import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [NgIf],
  template: `
    <div
      *ngIf="svc.active()"
      class="fixed inset-0 z-[60] grid place-items-center bg-white/70 backdrop-blur"
    >
      <div
        class="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow"
      >
        <svg
          class="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
          <path
            class="opacity-75"
            d="M4 12a8 8 0 018-8"
            stroke-width="4"
            stroke-linecap="round"
          />
        </svg>
        <span class="text-sm text-slate-700">Cargando…</span>
      </div>
    </div>
  `,
})
export class LoadingComponent {
  constructor(public svc: LoadingService) {}
}
