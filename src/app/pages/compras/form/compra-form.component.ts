import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CompraService } from '../../../services/compra.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { CompraItemCreate } from '../../../interfaces/compra.interface';
import { NotifyService } from '../../../core/notify/notify.service';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { InputComponent } from '../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { SaveCancelComponent } from '../../../shared/ui/buttons/ui-button-save-cancel/save-cancel.component';
import { SummaryComponent } from '../../../shared/ui/summary/summary.component';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { LucideAngularModule, X, Plus } from 'lucide-angular';
import { ProveedoresService } from '../../../services/proveedores.service';

@Component({
  selector: 'app-compra-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionContainerComponent,
    InputComponent,
    AppSelectComponent,
    SaveCancelComponent,
    SummaryComponent,
    UiButtonComponent,
    LucideAngularModule,
  ],
  templateUrl: './compra-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CompraFormPage implements OnInit {
  private api = inject(CompraService);
  private proveedoresApi = inject(ProveedoresService);
  private ingredientesApi = inject(IngredienteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  // Íconos
  X = X;
  Plus = Plus;

  loading = false;
  proveedores: Array<{ id: number; nombre: string }> = [];
  ingredientes: Array<{ id: number; nombre: string }> = [];

  form = new FormGroup({
    proveedorId: new FormControl<number | null>(null, [Validators.required]),
    referencia: new FormControl<string>('', { nonNullable: true }),
    observaciones: new FormControl<string>('', { nonNullable: true }),
    items: new FormArray<FormGroup>([]),
  });

  ngOnInit(): void {
    this.loadProveedores();
    this.loadIngredientes();
    this.agregarItem(); // Agregar un item vacío por defecto
  }

  private loadProveedores(): void {
    this.proveedoresApi.listar().subscribe({
      next: (arr) => {
        this.proveedores = (arr ?? []).map((prov: any) => ({
          id: Number(prov?.id ?? prov?.proveedorId),
          nombre: prov?.nombre ?? '',
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.notify.handleError(err, 'Error al cargar proveedores');
      },
    });
  }

  private loadIngredientes(): void {
    this.ingredientesApi.listar().subscribe({
      next: (arr) => {
        this.ingredientes = (arr ?? []).map((ing: any) => ({
          id: Number(ing?.id ?? ing?.ingredienteId),
          nombre: ing?.nombre ?? '',
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar ingredientes:', err);
        this.notify.handleError(err, 'Error al cargar ingredientes');
      },
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  agregarItem(): void {
    const itemGroup = new FormGroup({
      ingredienteId: new FormControl<number | null>(null, [Validators.required]),
      cantidad: new FormControl<number>(1, [
        Validators.required,
        Validators.min(0.001),
        Validators.pattern(/^\d+(\.\d{1,3})?$/) // Números con hasta 3 decimales
      ]),
      costoUnitario: new FormControl<number>(0, [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/) // Números con hasta 2 decimales
      ]),
    });
    this.items.push(itemGroup);
    this.cdr.markForCheck();
  }

  removerItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.cdr.markForCheck();
    } else {
      this.notify.warning('Debe haber al menos un item en la compra');
    }
  }

  calcularSubtotal(index: number): number {
    const item = this.items.at(index).value;
    return (item.cantidad ?? 0) * (item.costoUnitario ?? 0);
  }

  calcularTotal(): number {
    return this.items.controls.reduce((sum, control) => {
      const item = control.value;
      return sum + (item.cantidad ?? 0) * (item.costoUnitario ?? 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.warning('Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    if (this.items.length === 0) {
      this.notify.warning('Debe agregar al menos un item a la compra');
      return;
    }

    const value = this.form.value;
    const items: CompraItemCreate[] = (value.items ?? []).map((item: any) => ({
      ingredienteId: Number(item.ingredienteId),
      cantidad: Number(item.cantidad),
      costoUnitario: Number(item.costoUnitario),
    }));

    const dto = {
      proveedorId: Number(value.proveedorId),
      referencia: value.referencia?.trim() || null,
      observaciones: value.observaciones?.trim() || null,
      items,
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.api.crear(dto).subscribe({
      next: () => {
        this.notify.success('Compra registrada correctamente');
        this.router.navigate(['/compras']);
      },
      error: (err) => {
        console.error('Error al crear compra:', err);
        this.notify.handleError(err, 'Error al registrar la compra');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/compras']);
  }
}
