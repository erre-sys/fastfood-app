import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GrupoPlatoService } from '../../../../services/grupo-plato.service';

import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SectionContainerComponent } from '../../../../shared/ui/section-container/section-container.component';
import { AppSelectComponent } from '../../../../shared/ui/select/select.component';
import { SaveCancelComponent } from '../../../../shared';
import { GrupoPlatoCreate, GrupoPlatoUpdate } from '../../../../interfaces/grupo-plato.interface';

@Component({
  selector: 'app-grupo-plato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SectionContainerComponent, AppSelectComponent, SaveCancelComponent],
  templateUrl: './grupo-plato-form.component.html',
})
export default class GrupoPlatoFormPage implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(GrupoPlatoService);

  id?: number;
  loading = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    estado: <'A'|'I'>'A'
  });

  get titleLabel() { return this.id ? 'Editar grupo de plato' : 'Nuevo grupo de plato'; }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.id = raw ? Number(raw) : undefined;

    if (this.id) {
      this.loading.set(true);
      this.api.obtener(this.id).subscribe({
        next: (g) => {
          this.form.setValue({
            nombre: g.nombre,
            estado: g.estado
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
      const body = this.form.getRawValue() as GrupoPlatoCreate;
      this.api.crear(body).subscribe({
        next: () => this.router.navigate(['/grupo-platos']),
        error: () => this.loading.set(false),
      });
    } else {
      const body: GrupoPlatoUpdate = { id: this.id, ...(this.form.getRawValue() as GrupoPlatoCreate) };
      this.api.actualizar(body).subscribe({
        next: () => this.router.navigate(['/grupo-platos']),
        error: () => this.loading.set(false),
      });
    }
  }

  onCancel() { history.back(); }
}
