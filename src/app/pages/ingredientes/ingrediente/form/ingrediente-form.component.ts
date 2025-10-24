import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';

import { InputComponent } from '../../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { SaveCancelComponent } from '../../../../shared';
import { IngredienteService } from '../../../../services/ingrediente.service';
import { NotifyService } from '../../../../core/notify/notify.service';
import { Estado, SN } from '../../../../interfaces/ingrediente.interface';

@Component({
  selector: 'app-ingrediente-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,InputComponent,AppSelectComponent, SectionContainerComponent,SaveCancelComponent],
  templateUrl: './ingrediente-form.component.html',
})
export default class IngredienteFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(IngredienteService);
  private gruposApi = inject(GrupoIngredienteService);
  private notify = inject(NotifyService);

  id?: number;
  loading = signal(false);

  grupos: Array<{ label: string; value: number }> = [];

  // Unidades disponibles
  unidades = [
    { label: 'Porcentaje', value: 'PORC' },
    { label: 'Gramos', value: 'G' },
    { label: 'Kilogramos', value: 'KG' },
    { label: 'Litros', value: 'LT' },
    { label: 'Mililitros', value: 'ML' },
    { label: 'Unidad', value: 'UND' },
    { label: 'Paquete', value: 'PACK' }
  ];

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(1)]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    grupoIngredienteId: <number | null>null,
    unidad: <string | null>null,
    esExtra: <SN>'N',
    aplicaComida: <SN>'N',
    precioExtra: <number | null>null,
    stockMinimo: <number | null>null,
    estado: <Estado>'A',
  });

  get titleLabel() {
    return this.id ? 'Editar ingrediente' : 'Nuevo ingrediente';
  }

  /**
   * Actualiza el estado del campo precioExtra según el valor de esExtra
   */
  private updatePrecioExtraState(): void {
    const esExtraValue = this.form.get('esExtra')!.value;
    const precioExtraCtrl = this.form.get('precioExtra')!;

    if (esExtraValue === 'S') {
      precioExtraCtrl.enable({ emitEvent: false });
    } else {
      precioExtraCtrl.disable({ emitEvent: false });
      precioExtraCtrl.setValue(null, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.gruposApi.listar().subscribe({
      next: (gs) => {
        this.grupos = (gs ?? []).map(g => ({ label: g.nombre, value: g.id }));
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.notify.handleError(err, 'Error al cargar grupos de ingredientes');
        this.grupos = [];
      },
    });

    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    // Suscribirse a cambios en esExtra para habilitar/deshabilitar precioExtra
    this.form.get('esExtra')!.valueChanges.subscribe(() => {
      this.updatePrecioExtraState();
    });

    // Establecer estado inicial del campo precioExtra
    this.updatePrecioExtraState();

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (it) => {
          this.form.patchValue({
            codigo: it.codigo,
            nombre: it.nombre,
            grupoIngredienteId: it.grupoIngredienteId,
            unidad: it.unidad,
            esExtra: it.esExtra,
            aplicaComida: it.aplicaComida,
            precioExtra: it.precioExtra,
            stockMinimo: it.stockMinimo,
            estado: it.estado,
          }, { emitEvent: false });

          // Actualizar estado del campo precioExtra después de cargar los datos
          this.updatePrecioExtraState();
        },
        error: (err) => {
          console.error('Error al cargar ingrediente:', err);
          this.notify.handleError(err, 'Error al cargar el ingrediente');
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

    if (this.form.value.esExtra !== 'S') {
      this.form.patchValue({ precioExtra: null }, { emitEvent: false });
    }

    const data = this.form.getRawValue();
    this.loading.set(true);

    if (!this.id) {
      this.api.crear(data as any).subscribe({
        next: () => {
          this.notify.success('Ingrediente creado correctamente');
          this.router.navigate(['/ingredientes']);
        },
        error: (err) => {
          console.error('Error al crear ingrediente:', err);
          this.notify.handleError(err, 'Error al crear ingrediente');
          this.loading.set(false);
        },
      });
    } else {
      this.api.actualizar({ id: this.id, ...(data as any) }).subscribe({
        next: () => {
          this.notify.success('Ingrediente actualizado correctamente');
          this.router.navigate(['/ingredientes']);
        },
        error: (err) => {
          console.error('Error al actualizar ingrediente:', err);
          this.notify.handleError(err, 'Error al actualizar ingrediente');
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() { history.back(); }
}
