import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/**
 * Componente reutilizable para mostrar resúmenes/totales
 * Usa las clases del sistema de diseño definidas en assets/styles/ui-classes.css
 *
 * Casos de uso:
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

  /** Color del fondo - opciones: primary, accent, success, warning, danger, info */
  @Input() variant: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' = 'primary';

  /** Icono opcional de lucide-angular */
  @Input() icon?: LucideIconData;

  /** Tamaño del icono */
  @Input() iconSize = 24;

  /** Tamaño del componente */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Items adicionales para mostrar (subtotales, descuentos, etc.) */
  @Input() items: Array<{ label: string; value: string | number }> = [];
}
