import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { IngredienteService, SN, Estado } from '../../../../services/ingrediente.service';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';

import { InputComponent } from '../../../../shared/ui/input/input.component';
import { AppSelectComponent } from '../../../../shared/ui/select/select.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { SaveCancelComponent } from '../../../../shared';

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

  id?: number;
  loading = signal(false);

  grupos: Array<{ label: string; value: number }> = [];

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

  ngOnInit(): void {
    this.gruposApi.listar().subscribe({
      next: (gs) => (this.grupos = (gs ?? []).map(g => ({ label: g.nombre, value: g.id })) ),
      error: () => (this.grupos = []),
    });

    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    this.form.get('esExtra')!.valueChanges.subscribe((v) => {
      const ctrl = this.form.get('precioExtra')!;
      if (v === 'S') ctrl.enable({ emitEvent: false });
      else {
        ctrl.disable({ emitEvent: false });
        ctrl.setValue(null, { emitEvent: false });
      }
    });
    // estado inicial del control
    if (this.form.get('esExtra')!.value !== 'S') this.form.get('precioExtra')!.disable({ emitEvent: false });

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

          // forzar coherencia de precioExtra con esExtra
          const v = this.form.get('esExtra')!.value;
          const ctrl = this.form.get('precioExtra')!;
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
    if (this.form.value.esExtra !== 'S') this.form.patchValue({ precioExtra: null }, { emitEvent: false });

    this.loading.set(true);

    if (!this.id) {
      this.api.crear(this.form.getRawValue() as any).subscribe({
        next: () => this.router.navigate(['/ingredientes']),
        error: () => this.loading.set(false),
      });
    } else {
      this.api.actualizar({ id: this.id, ...(this.form.getRawValue() as any) }).subscribe({
        next: () => this.router.navigate(['/ingredientes']),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel() { history.back(); }
}
