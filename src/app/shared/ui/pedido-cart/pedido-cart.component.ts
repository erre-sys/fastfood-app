import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Minus, Trash2 } from 'lucide-angular';

export interface CartItem {
  platoId: number;
  platoNombre: string;
  precioBas: number;
  cantidad: number;
  extras: CartExtra[];
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
  template: `
    <div *ngIf="items.length === 0" class="text-center py-12 text-slate-400">
      <p class="font-medium">{{ emptyText }}</p>
    </div>

    <div *ngIf="items.length > 0" class="space-y-3">
      <div *ngFor="let item of items; let i = index" class="card p-4 bg-white border border-slate-200">
        <div class="grid grid-cols-12 gap-4">
          <!-- Info principal -->
          <div class="col-span-5">
            <h4 class="font-bold text-lg text-slate-900">{{ item.platoNombre }}</h4>
            <span class="text-base text-slate-600">\${{ item.precioBas.toFixed(2) }} c/u</span>
          </div>

          <!-- Controles de cantidad -->
          <div class="col-span-4 flex items-center gap-3">
            <button type="button" class="btn-icon btn-icon--md btn-icon--outline"
              style="min-width: 48px; min-height: 48px;"
              (click)="decreaseQuantity.emit(i)"
              [disabled]="loading || item.cantidad <= 1">
              <lucide-icon [img]="Minus" [size]="20"></lucide-icon>
            </button>
            <span class="font-bold text-lg px-2 min-w-[3rem] text-center">{{ item.cantidad }}</span>
            <button type="button" class="btn-icon btn-icon--md btn-icon--outline"
              style="min-width: 48px; min-height: 48px;"
              (click)="increaseQuantity.emit(i)"
              [disabled]="loading">
              <lucide-icon [img]="Plus" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Subtotal -->
          <div class="col-span-2 flex items-center justify-end font-bold text-xl text-orange-600">
            \${{ calculateSubtotal(item).toFixed(2) }}
          </div>

          <!-- Eliminar -->
          <div class="col-span-1 flex items-center justify-end">
            <button type="button" class="btn-icon btn-icon--sm btn-icon--danger"
              style="min-width: 48px; min-height: 48px;"
              (click)="removeItem.emit(i)" [disabled]="loading" title="Eliminar">
              <lucide-icon [img]="Trash2" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Extras -->
          <div *ngIf="item.extras.length > 0" class="col-span-12 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span class="text-sm text-slate-500 font-medium mr-1">Extras:</span>
            <div *ngFor="let extra of item.extras" class="px-3 py-1.5 bg-slate-50 rounded text-sm">
              {{ extra.ingredienteNombre }} ×{{ extra.cantidad }}
              <span class="text-orange-600 font-semibold">+\${{ (extra.precioExtra * extra.cantidad).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="card p-4 bg-orange-500 text-white">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">Total del Pedido:</span>
          <span class="text-3xl font-bold">\${{ calculateTotal().toFixed(2) }}</span>
        </div>
      </div>
    </div>
  `,
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
    const precioBase = item.precioBas * item.cantidad;
    const precioExtras = item.extras.reduce((sum, extra) => {
      return sum + (extra.precioExtra * extra.cantidad * item.cantidad);
    }, 0);
    return precioBase + precioExtras;
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + this.calculateSubtotal(item), 0);
  }
}
