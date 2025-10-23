import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PagoClienteService } from '../../../services/pago-cliente.service';
import { PagoClienteCreate } from '../../../interfaces/pago-cliente.interface';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  pedidoId: number | null = null;

  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
  ];

  form = new FormGroup({
    pedidoId: new FormControl<number | null>(null, [Validators.required]),
    montoTotal: new FormControl<number>(0, [Validators.required, Validators.min(0.01)]),
    metodo: new FormControl<string>('efectivo', [Validators.required]),
    referencia: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    // Intentar obtener el pedidoId de la ruta
    const pedidoIdParam = this.route.snapshot.paramMap.get('pedidoId');
    if (pedidoIdParam) {
      this.pedidoId = Number(pedidoIdParam);
      this.form.patchValue({ pedidoId: this.pedidoId });
      // Si viene desde un pedido específico, deshabilitar el campo
      this.form.controls.pedidoId.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue(); // getRawValue para incluir campos disabled
    const dto: PagoClienteCreate = {
      pedidoId: Number(value.pedidoId),
      montoTotal: Number(value.montoTotal),
      metodo: value.metodo as 'efectivo' | 'transferencia',
      referencia: value.referencia?.trim() || undefined,
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.api.crearPagoPedido(dto.pedidoId, dto).subscribe({
      next: () => {
        this.router.navigate(['/pagos-cliente']);
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/pagos-cliente']);
  }
}
