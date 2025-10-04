import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';

import { IngredienteService } from '../../../../services/ingrediente.service';
import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';
import { SaveCancelComponent } from '../../../../shared';

@Component({
  selector: 'app-ingrediente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SectionContainerComponent,
    SaveCancelComponent
  ],
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

  grupos: Array<{ id: number; nombre: string }> = [];

  form = this.fb.group({
    grupoIngredienteId: <number | null>null,
    codigo: ['', [Validators.required, Validators.maxLength(40)]],
    nombre: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(160)],
    ],
    unidad: ['', [Validators.required, Validators.maxLength(16)]],
    esExtra: <'S' | 'N'>'N',
    precioExtra: <number | null>null,
    stockMinimo: <number | null>null,
    estado: <'A' | 'I'>'A',
  });

  get titleLabel() {
    return this.id ? 'Editar ingrediente' : 'Nuevo ingrediente';
  }

  ngOnInit(): void {
    this.gruposApi.listar().subscribe({
      next: (arr) => {
        this.grupos = (arr ?? []).map((g) => ({
          id: g.grupo_ingrediente_id,
          nombre: g.nombre,
        }));
      },
      error: () => {},
    });

    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (r) => {
          this.form.patchValue({
            grupoIngredienteId: r.grupo_ingrediente_id ?? null,
            codigo: r.codigo ?? '',
            nombre: r.nombre ?? '',
            unidad: r.unidad ?? '',
            esExtra: r.es_extra ?? 'N',
            precioExtra: r.precio_extra ?? null,
            stockMinimo: r.stock_minimo ?? null,
            estado: r.estado ?? 'A',
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
    const v = this.form.getRawValue();

    const dtoBase = {
      codigo: v.codigo!,
      nombre: v.nombre!,
      grupo_ingrediente_id: v.grupoIngredienteId!, 
      unidad: v.unidad!,
      es_extra: v.esExtra!, 
      precio_extra: v.esExtra === 'S' ? v.precioExtra ?? null : null,
      stock_minimo: v.stockMinimo!,
      estado: v.estado!,
    };

    if (!this.id) {
      this.api.crear(dtoBase as any).subscribe({
        next: () => this.router.navigate(['/ingredientes']),
        error: () => this.loading.set(false),
      });
    } else {
      this.api
        .actualizar({
          ingrediente_id: this.id!, // 👈 snake
          ...dtoBase,
        } as any)
        .subscribe({
          next: () => this.router.navigate(['/ingredientes']),
          error: () => this.loading.set(false),
        });
    }
  }

  onCancel() {
    history.back();
  }
}
