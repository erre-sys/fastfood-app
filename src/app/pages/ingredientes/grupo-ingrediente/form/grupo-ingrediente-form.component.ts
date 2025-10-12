import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';

import { InputComponent } from '../../../../shared/ui/fields/input/input.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { AppSelectComponent } from '../../../../shared/ui/fields/select/select.component';
import { SaveCancelComponent } from '../../../../shared';
import { GrupoIngredienteCreate, GrupoIngredienteUpdate } from '../../../../interfaces/grupo-ingrediente.interface';

@Component({
  selector: 'app-grupo-ingrediente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputComponent, SectionContainerComponent, AppSelectComponent, SaveCancelComponent,
  ],
  templateUrl: './grupo-ingrediente-form.component.html',
})
export default class GrupoIngredienteFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(GrupoIngredienteService);

  id?: number;
  loading = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    estado: <'A'|'I'>'A',
    aplicaComida: <'S'|'N'>'N',   // 👈 camelCase para hablar directo con el back
  });

  get titleLabel() { return this.id ? 'Editar grupo' : 'Nuevo grupo'; }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (g) => {
          this.form.setValue({
            nombre: g.nombre,
            estado: g.estado,
            aplicaComida: g.aplicaComida ?? 'N',
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
      const body = this.form.getRawValue() as GrupoIngredienteCreate;
      this.api.crear(body).subscribe({
        next: () => this.router.navigate(['/grupo-ingredientes']),
        error: () => this.loading.set(false),
      });
    } else {
      const body: GrupoIngredienteUpdate = { id: this.id, ...(this.form.getRawValue() as GrupoIngredienteCreate) };
      this.api.actualizar(body).subscribe({
        next: () => this.router.navigate(['/grupo-ingredientes']),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel() { history.back(); }
}
