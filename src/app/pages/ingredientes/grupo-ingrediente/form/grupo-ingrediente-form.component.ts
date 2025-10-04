import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';

import { GrupoIngredienteService } from '../../../../services/grupo-ingrediente.service';
import { SaveCancelComponent } from '../../../../shared';

@Component({
  selector: 'app-grupo-ingrediente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SectionContainerComponent,
    SaveCancelComponent
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
      this.api.obtener(this.id).subscribe({
        next: (g) => this.form.setValue({ nombre: g.nombre, estado: g.estado }),
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
      this.api.crear(this.form.getRawValue()).subscribe({
        next: () => this.router.navigate(['/grupos']),
        error: () => this.loading.set(false),
      });
    } else {
      this.api
        .actualizar({
          grupo_ingrediente_id: this.id,
          ...this.form.getRawValue(),
        })
        .subscribe({
          next: () => this.router.navigate(['/grupos']),
          error: () => this.loading.set(false),
        });
    }
  }

  onCancel() {
    history.back();
  }
}
