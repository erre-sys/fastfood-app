// pago-proveedor-form.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { InputComponent, SectionContainerComponent, SaveCancelComponent } from '../../../../shared';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { PagosProveedorService } from '../../../../services/pago-proveedor.service';
import { MetodoPago, PagoProveedorCreate } from '../../../../interfaces/pago-proveedor.interface';
import { decimalDot } from '../../../../shared/ui/fields/input/decimal-dot.validator';

@Component({
  standalone: true,
  selector: 'app-pago-proveedor-form',
  imports: [CommonModule, ReactiveFormsModule, AppSelectComponent, InputComponent, SectionContainerComponent, SaveCancelComponent],
  templateUrl: './pago-proveedor-form.component.html',
})
export default class PagoProveedorFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private provApi = inject(ProveedoresService);
  private pagosApi = inject(PagosProveedorService);

  loading = signal(false);

  id?: number;
  preProvId = false; 

  proveedores: Array<{ value: number; label: string }> = [];

  form = this.fb.group({
    proveedorId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    metodo:      this.fb.control<MetodoPago>('TRANSFERENCIA', { validators: [Validators.required] }),
    referencia:  this.fb.control<string | null>(null),
    montoTotal:  this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(0.01), decimalDot(2)] }),
    observaciones: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    // cargar combo
    this.provApi.listarActivos().subscribe({
      next: arr => {
        this.proveedores = (arr ?? []).map((p: any) => ({
          value: Number(p?.id ?? p?.proveedorId ?? p?.proveedor_id),
          label: String(p?.nombre ?? p?.razonSocial ?? ''),
        }));
      }
    });

    // leer :id de la ruta
    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;
    this.preProvId = Number.isFinite(this.id as number); // true si vino id

    // si vino id, seteamos proveedorId en el form
    if (this.preProvId && this.id) {
      this.form.patchValue({ proveedorId: this.id }, { emitEvent: false });
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const body: PagoProveedorCreate = {
      proveedorId: Number(v.proveedorId),
      metodo: v.metodo!,
      referencia: v.referencia || undefined,
      montoTotal: Number(v.montoTotal),
      observaciones: v.observaciones || undefined,
    };

    this.loading.set(true);
    this.pagosApi.crear(body).subscribe({
      next: () => this.router.navigate(['/pago-proveedor']),
      error: () => this.loading.set(false),
    });
  }

  onCancel() { history.back(); }
}