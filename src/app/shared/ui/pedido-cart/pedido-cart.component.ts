import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Minus, Trash2 } from 'lucide-angular';

export interface CartItem {
  platoId: number;
  platoNombre: string;
  precioBase: number;
  cantidad: number;
  extras: CartExtra[];
  descuentoPct?: number;
}

export interface CartExtra {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  precioExtra: number;
}

@Component({
  selector: 'app-pedido-cart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedido-cart.component.html',
})
export class PedidoCartComponent {
  @Input() items: CartItem[] = [];
  @Input() loading = false;
  @Input() emptyText = 'El carrito está vacío';

  @Output() increaseQuantity = new EventEmitter<number>();
  @Output() decreaseQuantity = new EventEmitter<number>();
  @Output() removeItem = new EventEmitter<number>();

  Plus = Plus;
  Minus = Minus;
  Trash2 = Trash2;

  calculateSubtotal(item: CartItem): number {
    let precioBase = item.precioBase * item.cantidad;

    // Aplicar descuento si existe
    if (item.descuentoPct && item.descuentoPct > 0) {
      const descuento = precioBase * (item.descuentoPct / 100);
      precioBase = precioBase - descuento;
    }

    const precioExtras = item.extras.reduce((sum, extra) => {
      return sum + (extra.precioExtra * extra.cantidad * item.cantidad);
    }, 0);

    return precioBase + precioExtras;
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + this.calculateSubtotal(item), 0);
  }
}
