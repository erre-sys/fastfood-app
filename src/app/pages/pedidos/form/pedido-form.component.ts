import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

import { PedidoService } from '../../../services/pedido.service';
import { PlatoService } from '../../../services/plato.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { PromoProgramadaService } from '../../../services/promo-programada.service';
import { PedidoCreate, PedidoItemCreate, PedidoItemExtraCreate } from '../../../interfaces/pedido.interface';
import { NotifyService } from '../../../core/notify/notify.service';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { InputComponent } from '../../../shared/ui/fields/input/input.component';
import { SaveCancelComponent } from '../../../shared/ui/buttons/ui-button-save-cancel/save-cancel.component';
import { SummaryComponent } from '../../../shared/ui/summary/summary.component';
import { PedidoCartComponent, CartItem, CartExtra } from '../../../shared/ui/pedido-cart/pedido-cart.component';
import { LucideAngularModule, Plus, Trash2, Minus, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SectionContainerComponent,
    AppSelectComponent,
    InputComponent,
    SaveCancelComponent,
    SummaryComponent,
    PedidoCartComponent,
    LucideAngularModule,
  ],
  templateUrl: './pedido-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidoFormPage implements OnInit {
  private api = inject(PedidoService);
  private platosApi = inject(PlatoService);
  private ingredientesApi = inject(IngredienteService);
  private promosApi = inject(PromoProgramadaService);
  private router = inject(Router);
  private notify = inject(NotifyService);
  private cdr = inject(ChangeDetectorRef);

  // Íconos
  Plus = Plus;
  Trash2 = Trash2;
  Minus = Minus;
  ShoppingCart = ShoppingCart;


  loading = false;
  platos: Array<{ id: number; nombre: string; precioBase: number; grupoPlatoId: number }> = [];
  ingredientes: Array<{ id: number; nombre: string; codigo: string; precioExtra: number }> = [];

  // Promociones vigentes: platoId -> descuentoPct
  promocionesVigentes = new Map<number, number>();

  // Carrito de compras
  carrito: CartItem[] = [];

  // Extras para el plato actual
  extrasTemp: CartExtra[] = [];

  // Form para selección de plato
  platoForm = new FormGroup({
    platoId: new FormControl<number | null>(null),
    cantidad: new FormControl<number>(1, { nonNullable: true }),
  });

  // Form para extras
  extraForm = new FormGroup({
    ingredienteId: new FormControl<number | null>(null),
    cantidad: new FormControl<number>(1, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadPlatos();
    this.loadIngredientes();
    this.loadPromociones();
  }

  private loadPlatos(): void {
    this.platosApi.listar().subscribe({
      next: (arr) => {
        this.platos = (arr ?? []).map((p: any) => ({
          id: Number(p?.id ?? p?.platoId ?? -1),
          nombre: p?.nombre ?? '',
          precioBase: Number(p?.precioBase ?? p?.precio_base ?? 0),
          grupoPlatoId: Number(p?.grupoPlatoId ?? p?.grupo_plato_id ?? -1),
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al consultar platos:', err);
        this.notify.handleError(err, 'Error al cargar platos');
      },
    });
  }

  private loadIngredientes(): void {
    this.ingredientesApi.listar().subscribe({
      next: (arr) => {
        this.ingredientes = (arr ?? [])
          .filter((ing: any) => ing?.esExtra === 'S')
          .map((ing: any) => ({
            id: Number(ing?.id ?? ing?.ingredienteId ?? -1),
            nombre: ing?.nombre ?? '',
            codigo: ing?.codigo ?? '',
            precioExtra: Number(ing?.precioExtra ?? ing?.precio_extra ?? 0),
          }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al consultar ingredientes:', err);
        this.notify.handleError(err, 'Error al cargar ingredientes');
      },
    });
  }

  private loadPromociones(): void {
    this.promosApi.obtenerVigentes().subscribe({
      next: (arr) => {
        this.promocionesVigentes.clear();
        arr.forEach((promo) => {
          this.promocionesVigentes.set(promo.platoId, promo.descuentoPct);
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar promociones vigentes:', err);
      },
    });
  }

  // Agregar extra temporal (antes de agregar el plato al carrito)
  agregarExtraTemp(): void {
    const ingredienteId = this.extraForm.controls.ingredienteId.value;
    const cantidad = this.extraForm.controls.cantidad.value;

    if (!ingredienteId || cantidad <= 0) return;

    const ingrediente = this.ingredientes.find((i) => i.id === ingredienteId);
    if (!ingrediente) return;

    // Verificar si ya existe
    const existe = this.extrasTemp.find((e) => e.ingredienteId === ingredienteId);
    if (existe) {
      existe.cantidad += cantidad;
    } else {
      this.extrasTemp.push({
        ingredienteId: ingredienteId,
        ingredienteNombre: ingrediente.nombre,
        cantidad: cantidad,
        precioExtra: ingrediente.precioExtra,
      });
    }

    // Reset
    this.extraForm.reset({ ingredienteId: null, cantidad: 1 });
    this.cdr.markForCheck();
  }

  removerExtraTemp(index: number): void {
    this.extrasTemp.splice(index, 1);
    this.cdr.markForCheck();
  }

  // Agregar plato al carrito
  agregarPlatoAlCarrito(): void {
    const platoId = this.platoForm.controls.platoId.value;
    const cantidad = this.platoForm.controls.cantidad.value;

    if (!platoId || cantidad <= 0) return;

    const plato = this.platos.find((p) => p.id === platoId);
    if (!plato) return;

    // Verificar si ya existe en el carrito (mismo plato y mismos extras)
    const existe = this.carrito.find(
      (item) =>
        item.platoId === platoId &&
        this.extrasIguales(item.extras, this.extrasTemp)
    );

    if (existe) {
      existe.cantidad += cantidad;
    } else {
      // Verificar si hay promoción vigente para este plato
      const descuentoPct = this.promocionesVigentes.get(platoId);

      this.carrito.push({
        platoId: platoId,
        platoNombre: plato.nombre,
        precioBase: plato.precioBase,
        cantidad: cantidad,
        extras: [...this.extrasTemp],
        descuentoPct: descuentoPct,
      });
    }

    // Reset
    this.platoForm.reset({ platoId: null, cantidad: 1 });
    this.extrasTemp = [];
    this.cdr.markForCheck();
  }

  private extrasIguales(extras1: CartExtra[], extras2: CartExtra[]): boolean {
    if (extras1.length !== extras2.length) return false;

    const sorted1 = [...extras1].sort((a, b) => a.ingredienteId - b.ingredienteId);
    const sorted2 = [...extras2].sort((a, b) => a.ingredienteId - b.ingredienteId);

    return sorted1.every(
      (e, i) =>
        e.ingredienteId === sorted2[i].ingredienteId &&
        e.cantidad === sorted2[i].cantidad
    );
  }

  removerDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.cdr.markForCheck();
  }

  aumentarCantidad(item: CartItem): void {
    item.cantidad++;
    this.cdr.markForCheck();
  }

  disminuirCantidad(item: CartItem): void {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.cdr.markForCheck();
    }
  }

  calcularSubtotal(item: CartItem): number {
    const precioBase = item.precioBase * item.cantidad;
    const precioExtras = item.extras.reduce((sum, extra) => {
      return sum + (extra.precioExtra * extra.cantidad * item.cantidad);
    }, 0);
    return precioBase + precioExtras;
  }

  calcularTotal(): number {
    return this.carrito.reduce((sum, item) => sum + this.calcularSubtotal(item), 0);
  }

  calcularTotalExtrasTemp(): number {
    const cantidadPlato = this.platoForm.controls.cantidad.value;
    return this.extrasTemp.reduce((sum, extra) => {
      return sum + (extra.precioExtra * extra.cantidad * cantidadPlato);
    }, 0);
  }

  calcularPrecioPreview(): number {
    const platoId = this.platoForm.controls.platoId.value;
    const cantidadPlato = this.platoForm.controls.cantidad.value;

    if (!platoId) return 0;
    const plato = this.platos.find(p => p.id === platoId);
    if (!plato) return 0;
    return (plato.precioBase * cantidadPlato) + this.calcularTotalExtrasTemp();
  }

  onSubmit(): void {
    if (this.carrito.length === 0) {
      this.notify.warning('Agregue al menos un plato al pedido');
      return;
    }

    const dto: PedidoCreate = {
      items: this.carrito.map((item) => ({
        platoId: item.platoId,
        cantidad: item.cantidad,
        extras:
          item.extras.length > 0
            ? item.extras.map((e) => ({
                ingredienteId: e.ingredienteId,
                cantidad: e.cantidad,
              }))
            : undefined,
      })),
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.api.crear(dto).subscribe({
      next: () => {
        this.notify.success('Pedido creado correctamente');
        this.router.navigate(['/pedidos']);
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        this.notify.handleError(err, 'Error al crear pedido');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  ajustarCantidad(form: FormGroup, delta: number): void {
  const control = form.controls['cantidad'];
  const nueva = Math.max(1, (control.value ?? 1) + delta);
  control.setValue(nueva);
  this.cdr.markForCheck();
}


  cancel(): void {
    this.router.navigate(['/pedidos']);
  }

  getPlatoNombre(id: number): string {
    return this.platos.find((p) => p.id === id)?.nombre ?? '';
  }

  getIngredienteNombre(id: number): string {
    return this.ingredientes.find((i) => i.id === id)?.nombre ?? '';
  }
}
