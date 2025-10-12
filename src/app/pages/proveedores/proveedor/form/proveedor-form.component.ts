import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Proveedor, ProveedorCreate } from '../../../../interfaces/proveedor.interface';
import { ProveedoresService } from '../../../../services/proveedores.service';
import { SaveCancelComponent, InputComponent, SectionContainerComponent } from '../../../../shared';
import { AppSelectComponent } from '../../../../shared/ui/select/select.component';

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

  id?: number;
  loading = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required]],
    telefono: [''],
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);

    if (!this.id) {
      const body = this.form.getRawValue() as ProveedorCreate;
      this.api.crear(body).subscribe({
        next: () => this.router.navigate(['/proveedores']),
        error: () => this.loading.set(false),
      });
    } else {
      const body: Proveedor = {
        id: this.id,
        ...(this.form.getRawValue() as ProveedorCreate),
      };
      this.api.actualizar(body).subscribe({
        next: () => this.router.navigate(['/proveedores']),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel() {
    history.back();
  }
}
  