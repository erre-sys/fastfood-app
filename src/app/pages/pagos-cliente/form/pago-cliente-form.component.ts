import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PagoClienteService } from '../../../services/pago-cliente.service';
import { PedidoService } from '../../../services/pedido.service';
import { PagoClienteCreate, MetodoPago } from '../../../interfaces/pago-cliente.interface';
import { NotifyService } from '../../../core/notify/notify.service';
import { authService } from '../../../core/auth/auth.service';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { InputComponent } from '../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { SaveCancelComponent } from '../../../shared/ui/buttons/ui-button-save-cancel/save-cancel.component';

@Component({
  selector: 'app-pago-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionContainerComponent,
    InputComponent,
    AppSelectComponent,
    SaveCancelComponent,
  ],
  templateUrl: './pago-cliente-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagoClienteFormPage implements OnInit {
  private api = inject(PagoClienteService);
  private pedidosApi = inject(PedidoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  loading = false;
  pedidoId: number | null = null;

  pedidos: Array<{ value: number; label: string }> = [];

  metodosPago = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA', label: 'Tarjeta' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'DEPOSITO', label: 'Depósito' },
  ];

  form = new FormGroup({
    pedidoId: new FormControl<number | null>(null, [Validators.required]),
    montoTotal: new FormControl<number>(0, [Validators.required, Validators.min(0.01)]),
    metodo: new FormControl<string>('EFECTIVO', [Validators.required]),
    referencia: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    // Cargar pedidos con estado Entregado
    this.loadPedidos();

    // Intentar obtener el pedidoId de la ruta
    const pedidoIdParam = this.route.snapshot.paramMap.get('pedidoId');
    if (pedidoIdParam) {
      this.pedidoId = Number(pedidoIdParam);
      this.form.patchValue({ pedidoId: this.pedidoId });
      // Si viene desde un pedido específico, deshabilitar el campo
      this.form.controls.pedidoId.disable();
    }
  }

  private loadPedidos(): void {
    // Filtrar solo pedidos con estado 'E' (Entregado)
    const filtros = [{ llave: 'estado', operacion: '=', valor: 'E' }];

    this.pedidosApi.buscarPaginado({ page: 0, size: 1000, sortBy: 'id', direction: 'desc' }, filtros).subscribe({
      next: (response) => {
        const contenido = response?.contenido ?? response?.content ?? [];
        this.pedidos = contenido.map((p: any) => ({
          value: Number(p?.id ?? p?.pedidoId ?? p?.pedido_id),
          label: `Pedido #${p?.id} - $${Number(p?.totalNeto ?? p?.total_neto ?? 0).toFixed(2)}`,
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.notify.handleError(err, 'Error al cargar pedidos');
        this.pedidos = [];
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.warning('Por favor complete todos los campos requeridos');
      return;
    }

    const value = this.form.getRawValue(); // getRawValue para incluir campos disabled
    const userSub = authService.getSub();

    const dto: PagoClienteCreate = {
      pedidoId: Number(value.pedidoId),
      montoTotal: Number(value.montoTotal),
      metodo: value.metodo as MetodoPago,
      referencia: value.referencia?.trim() || undefined,
      creadoPorSub: userSub,
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.api.crear(dto).subscribe({
      next: () => {
        this.notify.success('Pago registrado correctamente');
        this.router.navigate(['/pagos-cliente']);
      },
      error: (err) => {
        console.error('Error al crear pago:', err);
        this.notify.handleError(err, 'Error al registrar pago');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/pagos-cliente']);
  }
}
