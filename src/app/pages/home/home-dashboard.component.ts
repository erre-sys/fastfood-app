import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Square, List, ShoppingBag, CalendarClock, DollarSign } from 'lucide-angular';

import { GrupoIngredienteService } from '../../services/grupo-ingrediente.service';
import { IngredienteService } from '../../services/ingrediente.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
  ],
  templateUrl: './home-dashboard.component.html',
})
export default class HomeDashboardComponent implements OnInit {
  // ---- Servicios reales disponibles ----
  private gruposApi = inject(GrupoIngredienteService);
  private ingredientesApi = inject(IngredienteService);

  // ---- Estado reactivo ----
  gruposCount = signal<number>(0);
  ingredientesCount = signal<number>(0);

  // Datos simulados (mock)
  pedidosCount = signal<number>(12); // TODO: reemplazar con pedidoService.count()
  montoPendiente = signal<number>(347.50); // TODO: reemplazar con pagoProveedorService.montoPendiente()
  transacciones = signal<any[]>([
    // TODO: reemplazar con historialService.ultimasTransacciones()
    { id: 1, tipo: 'Compra', valor: 85.75, fecha: '2025-10-04' },
    { id: 2, tipo: 'Venta', valor: 23.40, fecha: '2025-10-04' },
  ]);

  loading = signal(true);

  // ---- Iconos ----
  Square = Square;
  List = List;
  ShoppingBag = ShoppingBag;
  CalendarClock = CalendarClock;
  DollarSign = DollarSign;

  // ---- Métodos ----
  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);

    // Grupos de ingredientes
    this.gruposApi.listar().subscribe({
      next: (data: string | any[]) => this.gruposCount.set(data?.length ?? 0),
      error: () => this.gruposCount.set(0),
    });

    // Ingredientes
    this.ingredientesApi.listar().subscribe({
      next: (data) => this.ingredientesCount.set(data?.length ?? 0),
      error: () => this.ingredientesCount.set(0),
      complete: () => this.loading.set(false),
    });
  }

  now(): Date {
    return new Date();
  }
}
