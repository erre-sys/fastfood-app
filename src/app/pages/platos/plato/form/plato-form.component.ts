import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PlatoService} from '../../../../services/plato.service';
import { GrupoPlatoService } from '../../../../services/grupo-plato.service';

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

  id?: number;
  loading = signal(false);

  grupos: Array<{ label: string; value: number }> = [];

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(1)]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    grupoPlatoId: <number | null>null,
    estado: <Estado>'A',
    precioBase: <number | null>null,
    enPromocion: <SN>'N',
    descuentoPct: <number | null>null,
  });

  get titleLabel() {
    return this.id ? 'Editar plato' : 'Nuevo plato';
  }

  ngOnInit(): void {
    this.gruposApi.listar().subscribe({
      next: (gs) => (this.grupos = (gs ?? []).map(g => ({ label: g.nombre, value: g.id })) ),
      error: () => (this.grupos = []),
    });


    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    this.form.get('enPromocion')!.valueChanges.subscribe((v) => {
      const ctrl = this.form.get('descuentoPct')!;
      if (v === 'S') ctrl.enable({ emitEvent: false });
      else {
        ctrl.disable({ emitEvent: false });
        ctrl.setValue(null, { emitEvent: false });
      }
    });
    // estado inicial del control
    if (this.form.get('enPromocion')!.value !== 'S') this.form.get('descuentoPct')!.disable({ emitEvent: false });

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

          const v = this.form.get('enPromocion')!.value;
          const ctrl = this.form.get('descuentoPct')!;
          if (v === 'S') ctrl.enable({ emitEvent: false });
          else { ctrl.disable({ emitEvent: false }); ctrl.setValue(null, { emitEvent: false }); }
        },
        error: () => {},
        complete: () => this.loading.set(false),
      });
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // coherencia antes de enviar
    if (this.form.value.enPromocion !== 'S') this.form.patchValue({ descuentoPct: null }, { emitEvent: false });

    this.loading.set(true);

    if (!this.id) {
      this.api.crear(this.form.getRawValue() as any).subscribe({
        next: () => this.router.navigate(['/platos']),
        error: () => this.loading.set(false),
      });
    } else {
      this.api.actualizar({ id: this.id, ...(this.form.getRawValue() as any) }).subscribe({
        next: () => this.router.navigate(['/platos']),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel() { history.back(); }
}
