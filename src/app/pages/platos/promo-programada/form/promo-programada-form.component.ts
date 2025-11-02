import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PromoProgramadaService } from '../../../../services/promo-programada.service';
import { PlatoService } from '../../../../services/plato.service';
import { NotifyService } from '../../../../core/notify/notify.service';
import { Estado } from '../../../../interfaces/promo-programada.interface';
import { formatToBackendDateTime, formatFromBackendDateTime } from '../../../../shared/utils/date-format.util';

import { InputComponent } from '../../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { SaveCancelComponent } from '../../../../shared';

@Component({
  selector: 'app-promo-programada-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    AppSelectComponent,
    SectionContainerComponent,
    SaveCancelComponent,
  ],
  templateUrl: './promo-programada-form.component.html',
})
export default class PromoProgramadaFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PromoProgramadaService);
  private platosApi = inject(PlatoService);
  private notify = inject(NotifyService);

  id?: number;
  loading = signal(false);

  platos: Array<{ label: string; value: number }> = [];

  form = this.fb.group({
    platoId: <number | null>null,
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    descuentoPct: [
      <number | null>null,
      [Validators.required, Validators.min(0.01), Validators.max(100)],
    ],
    estado: <Estado>'A',
  });

  get titleLabel() {
    return this.id ? 'Editar Promoción' : 'Nueva Promoción';
  }

  ngOnInit(): void {
    this.platosApi.listar().subscribe({
      next: (ps) => (this.platos = (ps ?? []).map((p) => ({ label: p.nombre, value: p.id }))),
      error: (err) => {
        console.error('Error al cargar platos:', err);
        this.notify.handleError(err, 'Error al cargar platos');
        this.platos = [];
      },
    });

    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (it) => {
          this.form.patchValue({
            platoId: it.platoId,
            fechaInicio: formatFromBackendDateTime(it.fechaInicio),
            fechaFin: formatFromBackendDateTime(it.fechaFin),
            descuentoPct: it.descuentoPct,
            estado: it.estado,
          });
        },
        error: (err) => {
          console.error('Error al cargar promoción:', err);
          this.notify.handleError(err, 'Error al cargar la promoción');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.notify.warning('Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    this.loading.set(true);

    const values = this.form.getRawValue();

    // Convertir fechas al formato esperado por el backend: yyyy-MM-dd HH:mm:ss
    const dto = {
      platoId: values.platoId!,
      fechaInicio: formatToBackendDateTime(values.fechaInicio),
      fechaFin: formatToBackendDateTime(values.fechaFin),
      descuentoPct: values.descuentoPct!,
      estado: values.estado,
    };

    if (!this.id) {
      this.api.crear(dto).subscribe({
        next: () => {
          this.notify.success('Promoción creada correctamente');
          this.router.navigate(['/promo-programada']);
        },
        error: (err) => {
          console.error('Error al crear promoción:', err);
          this.notify.handleError(err, 'Error al crear promoción');
          this.loading.set(false);
        },
      });
    } else {
      this.api.actualizar({ id: this.id, ...dto }).subscribe({
        next: () => {
          this.notify.success('Promoción actualizada correctamente');
          this.router.navigate(['/promo-programada']);
        },
        error: (err) => {
          console.error('Error al actualizar promoción:', err);
          this.notify.handleError(err, 'Error al actualizar promoción');
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() {
    history.back();
  }
}
