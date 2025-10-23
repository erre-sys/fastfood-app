import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Proveedor, ProveedorCreate } from '../../../../interfaces/proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { SaveCancelComponent, InputComponent, SectionContainerComponent } from '../../../../shared';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { NotifyService } from '../../../../core/notify/notify.service';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SectionContainerComponent,
    AppSelectComponent,
    SaveCancelComponent,
  ],
  templateUrl: './proveedor-form.component.html',
})
export default class ProveedorFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ProveedoresService);
  private notify = inject(NotifyService);

  id?: number;
  loading = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/), // Solo números
      Validators.minLength(10), // RUC mínimo 10 dígitos
      Validators.maxLength(13)  // RUC máximo 13 dígitos
    ]],
    telefono: ['', [
      Validators.pattern(/^[0-9]+$/), // Solo números
      Validators.minLength(7),
      Validators.maxLength(15)
    ]],
    email: ['', [Validators.email]],
    estado: <'A' | 'I'>'A',
  });

  get titleLabel() {
    return this.id ? 'Editar grupo' : 'Nuevo grupo';
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    if (this.id) {
      this.loading.set(true);
      this.api.obtenerPorId(this.id).subscribe({
        next: (g) => {
          this.form.setValue({
            nombre: g.nombre,
            ruc: g.ruc,
            telefono: g.telefono,
            email: g.email,
            estado: g.estado,
          });
        },
        error: () => {},
        complete: () => this.loading.set(false),
      });
    }
  }

  onSubmit(): void {
    console.log('💾 [PROVEEDOR-FORM] Iniciando envío de formulario');
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn('⚠️ [PROVEEDOR-FORM] Formulario inválido');
      this.notify.warning('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }

    console.log('📤 [PROVEEDOR-FORM] Datos a enviar:', this.form.getRawValue());
    this.loading.set(true);

    if (!this.id) {
      const body = this.form.getRawValue() as ProveedorCreate;
      this.api.crear(body).subscribe({
        next: () => {
          console.log('✅ [PROVEEDOR-FORM] Proveedor creado exitosamente');
          this.notify.success('Proveedor creado correctamente');
          this.router.navigate(['/proveedores']);
        },
        error: (err) => {
          console.error('❌ [PROVEEDOR-FORM] Error al crear proveedor:', err);
          this.notify.handleError(err, 'Error al crear proveedor');
          this.loading.set(false);
        },
      });
    } else {
      const body: Proveedor = {
        id: this.id,
        ...(this.form.getRawValue() as ProveedorCreate),
      };
      this.api.actualizar(body).subscribe({
        next: () => {
          console.log('✅ [PROVEEDOR-FORM] Proveedor actualizado exitosamente');
          this.notify.success('Proveedor actualizado correctamente');
          this.router.navigate(['/proveedores']);
        },
        error: (err) => {
          console.error('❌ [PROVEEDOR-FORM] Error al actualizar proveedor:', err);
          this.notify.handleError(err, 'Error al actualizar proveedor');
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() {
    history.back();
  }
}
  