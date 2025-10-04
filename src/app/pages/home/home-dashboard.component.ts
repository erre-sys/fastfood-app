import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PageLayoutComponent } from '../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../shared/ui/title/title.component';
import { SectionContainerComponent } from '../../shared/ui/section-container/section-container.component';

import {
  PromoProgramada,
  PromoProgramadaService,
} from '../../services/promo-programada.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    SlicePipe,
    PageLayoutComponent,
    TitleComponent,
    SectionContainerComponent,
    RouterLink,
  ],
  templateUrl: './home-dashboard.component.html',
})
export default class HomeDashboardComponent implements OnInit {
  private promosApi = inject(PromoProgramadaService);

  titleLabel = 'Inicio';
  loading = signal(true);
  promos = signal<PromoProgramada[]>([]);

  // mock simple de usuario (ajusta cuando tengas tu servicio de auth)
  user = {
    nombre: 'Usuario',
    email: 'usuario@fastfood.local',
    rol: 'Operador',
  };

  ngOnInit(): void {
    this.promosApi.listar().subscribe({
      next: (data) => this.promos.set(data ?? []),
      error: () => this.promos.set([]),
      complete: () => this.loading.set(false),
    });
  }

  // helpers UI
  isActiva(p: PromoProgramada): boolean {
    if (p.estado !== 'A') return false;
    const hoy = new Date().setHours(0, 0, 0, 0);
    const ini = new Date(p.fecha_inicio).setHours(0, 0, 0, 0);
    const fin = new Date(p.fecha_fin).setHours(23, 59, 59, 999);
    // si no hay fechas válidas, la consideramos activa por estado
    if (Number.isNaN(ini) || Number.isNaN(fin)) return true;
    return hoy >= ini && hoy <= fin;
  }

  statusBadgeClass(p: PromoProgramada): string {
    return this.isActiva(p) ? 'badge--ok' : 'badge--muted';
  }
}
