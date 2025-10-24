import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PlatoService} from '../../../../services/plato.service';
import { GrupoPlatoService } from '../../../../services/grupo-plato.service';
import { NotifyService } from '../../../../core/notify/notify.service';

import { InputComponent } from '../../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { SaveCancelComponent } from '../../../../shared';
import { Estado, SN } from '../../../../interfaces/plato.interface';

@Component({
  selector: 'app-plato-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,InputComponent,AppSelectComponent, SectionContainerComponent,SaveCancelComponent],
  templateUrl: './plato-form.component.html',
})
export default class PlatoFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlatoService);
  private gruposApi = inject(GrupoPlatoService);
  private notify = inject(NotifyService);

  id?: number;
  loading = signal(false);

  grupos: Array<{ label: string; value: number }> = [];

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(1)]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    grupoPlatoId: [<number | null>null],
    estado: [<Estado>'A'],
    precioBase: [<number | null>null, [
      Validators.required,
      Validators.min(0.01),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]],
    enPromocion: [<SN>'N'],
    descuentoPct: [<number | null>null, [
      Validators.min(0),
      Validators.max(100),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]],
  });

  get titleLabel() {
    return this.id ? 'Editar plato' : 'Nuevo plato';
  }

  /**
   * Actualiza el estado del campo descuentoPct según el valor de enPromocion
   */
  private updateDescuentoPctState(): void {
    const enPromocionValue = this.form.get('enPromocion')!.value;
    const descuentoPctCtrl = this.form.get('descuentoPct')!;

    if (enPromocionValue === 'S') {
      descuentoPctCtrl.enable({ emitEvent: false });
    } else {
      descuentoPctCtrl.disable({ emitEvent: false });
      descuentoPctCtrl.setValue(null, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.gruposApi.listar().subscribe({
      next: (gs) => {
        this.grupos = (gs ?? []).map(g => ({ label: g.nombre, value: g.id }));
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.notify.handleError(err, 'Error al cargar grupos de platos');
        this.grupos = [];
      },
    });

    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    // Suscribirse a cambios en enPromocion para habilitar/deshabilitar descuentoPct
    this.form.get('enPromocion')!.valueChanges.subscribe(() => {
      this.updateDescuentoPctState();
    });

    // Establecer estado inicial del campo descuentoPct
    this.updateDescuentoPctState();

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (it) => {
          this.form.patchValue({
            codigo: it.codigo,
            nombre: it.nombre,
            grupoPlatoId: it.grupoPlatoId,
            estado: it.estado,
            precioBase: it.precioBase,
            enPromocion: it.enPromocion,
            descuentoPct: it.descuentoPct,
          }, { emitEvent: false });

          // Actualizar estado del campo descuentoPct después de cargar los datos
          this.updateDescuentoPctState();
        },
        error: (err) => {
          console.error('Error al cargar plato:', err);
          this.notify.handleError(err, 'Error al cargar el plato');
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

    if (this.form.value.enPromocion !== 'S') {
      this.form.patchValue({ descuentoPct: null }, { emitEvent: false });
    }

    const data = this.form.getRawValue();
    this.loading.set(true);

    if (!this.id) {
      this.api.crear(data as any).subscribe({
        next: () => {
          this.notify.success('Plato creado correctamente');
          this.router.navigate(['/platos']);
        },
        error: (err) => {
          console.error('Error al crear plato:', err);
          this.notify.handleError(err, 'Error al crear plato');
          this.loading.set(false);
        },
      });
    } else {
      this.api.actualizar({ id: this.id, ...(data as any) }).subscribe({
        next: () => {
          this.notify.success('Plato actualizado correctamente');
          this.router.navigate(['/platos']);
        },
        error: (err) => {
          console.error('Error al actualizar plato:', err);
          this.notify.handleError(err, 'Error al actualizar plato');
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() { history.back(); }
}
