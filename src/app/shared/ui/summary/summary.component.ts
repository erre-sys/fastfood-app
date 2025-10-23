import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/**
 * Componente reutilizable para mostrar resúmenes/totales
 * Puede usarse para:
 * - Total de pedidos
 * - Total de compras
 * - Resumen de recetas
 * - Totales de inventario
 * - Cualquier resumen numérico
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  /** Texto del label (ej: "Total del Pedido", "Costo Total") */
  @Input() label = 'Total';

  /** Valor a mostrar (puede ser número o string formateado) */
  @Input() value: string | number = 0;

  /** Color del fondo - opciones: primary, success, warning, danger, info, accent */
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' = 'primary';

  /** Icono opcional de lucide-angular */
  @Input() icon?: LucideIconData;

  /** Tamaño del icono */
  @Input() iconSize = 24;

  /** Tamaño del componente */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Items adicionales para mostrar (subtotales, descuentos, etc.) */
  @Input() items: Array<{ label: string; value: string | number }> = [];

  get bgColorClass(): string {
    const colors = {
      primary: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-500',
      danger: 'bg-red-600',
      info: 'bg-cyan-600',
      accent: 'bg-orange-500',
    };
    return colors[this.variant];
  }

  get textSizeClass(): string {
    const sizes = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    };
    return sizes[this.size];
  }

  get labelSizeClass(): string {
    const sizes = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    };
    return sizes[this.size];
  }

  get paddingClass(): string {
    const paddings = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    return paddings[this.size];
  }
}
