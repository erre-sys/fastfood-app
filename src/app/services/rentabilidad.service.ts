import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { PlatoService } from './plato.service';
import { RecetaService } from './receta.service';
import { CompraService } from './compra.service';

/**
 * Interface para análisis de rentabilidad de platos
 */
export interface RentabilidadPlato {
  platoId: number;
  platoNombre: string;
  platoCodigo: string;
  precioVenta: number;
  costoIngredientes: number;
  margenBruto: number;
  porcentajeGanancia: number;
  estado: 'EXCELENTE' | 'BUENO' | 'BAJO' | 'CRITICO' | 'SIN_DATOS';
  detalleIngredientes?: DetalleIngrediente[];
  tieneReceta: boolean;
}

export interface DetalleIngrediente {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  porcentajeDelCosto: number;
}

/**
 * Servicio para calcular rentabilidad de platos
 */
@Injectable({ providedIn: 'root' })
export class RentabilidadService {
  private platoApi = inject(PlatoService);
  private recetaApi = inject(RecetaService);
  private compraApi = inject(CompraService);

  /**
   * Calcula la rentabilidad de todos los platos
   */
  calcularRentabilidadPlatos(): Observable<RentabilidadPlato[]> {
    return this.platoApi.listar().pipe(
      map((platos: any[]) => {
        // Crear observables para cada plato
        const rentabilidadObservables = platos.map(plato =>
          this.calcularRentabilidadPlato(plato.id, plato)
        );

        // Esperar a que todos terminen
        return forkJoin(rentabilidadObservables);
      }),
      // Aplanar el Observable<Observable<RentabilidadPlato[]>> a Observable<RentabilidadPlato[]>
      map((obsArray: any) => obsArray),
      catchError(err => {
        console.error('Error al calcular rentabilidad de platos:', err);
        return of([]);
      })
    );
  }

  /**
   * Calcula la rentabilidad de UN plato específico
   */
  calcularRentabilidadPlato(platoId: number, platoData?: any): Observable<RentabilidadPlato> {
    // Si no tenemos los datos del plato, los obtenemos
    const plato$ = platoData
      ? of(platoData)
      : this.platoApi.obtenerPorId(platoId);

    return plato$.pipe(
      map((plato: any) => {
        const precioVenta = Number(plato?.precioBase ?? 0);

        // Si no tiene precio, retornar sin datos
        if (!precioVenta || precioVenta <= 0) {
          return {
            platoId: plato.id,
            platoNombre: plato.nombre ?? '',
            platoCodigo: plato.codigo ?? '',
            precioVenta: 0,
            costoIngredientes: 0,
            margenBruto: 0,
            porcentajeGanancia: 0,
            estado: 'SIN_DATOS' as const,
            tieneReceta: false,
          };
        }

        // Obtener la receta del plato
        return this.recetaApi.obtenerReceta(platoId).pipe(
          map((receta: any[]) => {
            if (!receta || receta.length === 0) {
              // No tiene receta
              return {
                platoId: plato.id,
                platoNombre: plato.nombre ?? '',
                platoCodigo: plato.codigo ?? '',
                precioVenta,
                costoIngredientes: 0,
                margenBruto: precioVenta,
                porcentajeGanancia: 100,
                estado: 'SIN_DATOS' as const,
                tieneReceta: false,
              };
            }

            // Calcular el costo total (simplificado por ahora)
            // TODO: Obtener costos reales de las últimas compras
            const costoIngredientes = this.calcularCostoReceta(receta);

            const margenBruto = precioVenta - costoIngredientes;
            const porcentajeGanancia = precioVenta > 0
              ? (margenBruto / precioVenta) * 100
              : 0;

            const estado = this.determinarEstado(porcentajeGanancia);

            return {
              platoId: plato.id,
              platoNombre: plato.nombre ?? '',
              platoCodigo: plato.codigo ?? '',
              precioVenta,
              costoIngredientes,
              margenBruto,
              porcentajeGanancia,
              estado,
              tieneReceta: true,
              detalleIngredientes: this.calcularDetalleIngredientes(receta, costoIngredientes),
            };
          }),
          catchError(err => {
            console.error(`Error al obtener receta del plato ${platoId}:`, err);
            return of({
              platoId: plato.id,
              platoNombre: plato.nombre ?? '',
              platoCodigo: plato.codigo ?? '',
              precioVenta,
              costoIngredientes: 0,
              margenBruto: precioVenta,
              porcentajeGanancia: 100,
              estado: 'SIN_DATOS' as const,
              tieneReceta: false,
            });
          })
        );
      }),
      // Aplanar el observable anidado
      map((obs: any) => obs),
      catchError(err => {
        console.error(`Error al calcular rentabilidad del plato ${platoId}:`, err);
        return of({
          platoId,
          platoNombre: 'Error',
          platoCodigo: '',
          precioVenta: 0,
          costoIngredientes: 0,
          margenBruto: 0,
          porcentajeGanancia: 0,
          estado: 'SIN_DATOS' as const,
          tieneReceta: false,
        });
      })
    );
  }

  /**
   * Calcula el costo total de una receta
   * Por ahora usa un costo estimado fijo, luego se puede mejorar
   * para obtener el costo promedio de las últimas compras
   */
  private calcularCostoReceta(receta: any[]): number {
    // TODO: Mejorar para obtener costos reales del servicio de compras
    // Por ahora, estimamos un costo base por ingrediente
    return receta.reduce((total, item) => {
      const cantidad = Number(item?.cantidad ?? 0);
      // Costo estimado: $0.50 por unidad (temporal)
      const costoUnitarioEstimado = 0.50;
      return total + (cantidad * costoUnitarioEstimado);
    }, 0);
  }

  /**
   * Calcula el detalle de costos por ingrediente
   */
  private calcularDetalleIngredientes(
    receta: any[],
    costoTotal: number
  ): DetalleIngrediente[] {
    return receta.map(item => {
      const cantidad = Number(item?.cantidad ?? 0);
      const costoUnitarioEstimado = 0.50; // TODO: Obtener costo real
      const costoTotalItem = cantidad * costoUnitarioEstimado;
      const porcentaje = costoTotal > 0
        ? (costoTotalItem / costoTotal) * 100
        : 0;

      return {
        ingredienteId: item.ingredienteId,
        ingredienteNombre: item.ingredienteNombre ?? 'Ingrediente',
        cantidad,
        costoUnitario: costoUnitarioEstimado,
        costoTotal: costoTotalItem,
        porcentajeDelCosto: porcentaje,
      };
    });
  }

  /**
   * Determina el estado de rentabilidad según el porcentaje de ganancia
   */
  private determinarEstado(porcentaje: number): 'EXCELENTE' | 'BUENO' | 'BAJO' | 'CRITICO' | 'SIN_DATOS' {
    if (porcentaje >= 60) return 'EXCELENTE'; // 60% o más
    if (porcentaje >= 40) return 'BUENO';      // 40-59%
    if (porcentaje >= 20) return 'BAJO';       // 20-39%
    if (porcentaje >= 0) return 'CRITICO';     // 0-19%
    return 'SIN_DATOS';                        // Negativo o sin datos
  }

  /**
   * Obtiene el costo promedio de un ingrediente basado en las últimas compras
   * TODO: Implementar cuando se necesite
   */
  obtenerCostoPromedioIngrediente(ingredienteId: number): Observable<number> {
    // Por ahora retorna un valor fijo
    return of(0.50);

    // TODO: Implementación real
    // return this.compraApi.obtenerUltimasCompras(ingredienteId, 5).pipe(
    //   map((compras: any[]) => {
    //     if (!compras || compras.length === 0) return 0;
    //     const suma = compras.reduce((acc, c) => acc + Number(c.costoUnitario ?? 0), 0);
    //     return suma / compras.length;
    //   })
    // );
  }

  /**
   * Helpers para UI
   */
  getEstadoColor(estado: RentabilidadPlato['estado']): string {
    const colores = {
      EXCELENTE: 'success',
      BUENO: 'info',
      BAJO: 'warning',
      CRITICO: 'danger',
      SIN_DATOS: 'muted',
    };
    return colores[estado] || 'muted';
  }

  getEstadoLabel(estado: RentabilidadPlato['estado']): string {
    const labels = {
      EXCELENTE: 'Excelente',
      BUENO: 'Bueno',
      BAJO: 'Bajo',
      CRITICO: 'Crítico',
      SIN_DATOS: 'Sin Datos',
    };
    return labels[estado] || 'Sin Datos';
  }

  getEstadoIcon(estado: RentabilidadPlato['estado']): string {
    const icons = {
      EXCELENTE: '🟢',
      BUENO: '🔵',
      BAJO: '🟡',
      CRITICO: '🔴',
      SIN_DATOS: '⚪',
    };
    return icons[estado] || '⚪';
  }
}
