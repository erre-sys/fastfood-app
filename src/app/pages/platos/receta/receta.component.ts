import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { RecetaService } from '../../../services/receta.service';
import { PlatoService } from '../../../services/plato.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { RecetaItemDTO } from '../../../interfaces/receta.interface';
import { NotifyService } from '../../../core/notify/notify.service';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { InputComponent } from '../../../shared/ui/fields/input/input.component';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { SaveCancelComponent } from '../../../shared/ui/buttons/ui-button-save-cancel/save-cancel.component';
import { LucideAngularModule, X, Plus } from 'lucide-angular';

@Component({
  selector: 'app-receta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionContainerComponent,
    InputComponent,
    AppSelectComponent,
    SaveCancelComponent,
    LucideAngularModule,
  ],
  templateUrl: './receta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RecetaPage implements OnInit {
  private api = inject(RecetaService);
  private platoApi = inject(PlatoService);
  private ingredientesApi = inject(IngredienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  // Íconos
  X = X;
  Plus = Plus;

  loading = false;
  platoId!: number;
  platoNombre = '';
  ingredientes: Array<{ id: number; nombre: string; codigo: string; aplicaComida: string; estado: string }> = [];
  // Solo ingredientes activos que apliquen para comida
  ingredientesValidos: Array<{ id: number; nombre: string; codigo: string }> = [];

  form = new FormGroup({
    items: new FormArray<FormGroup>([]),
  });

  ngOnInit(): void {
    this.platoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.platoId) {
      this.router.navigate(['/platos']);
      return;
    }

    this.loadPlato();
    this.loadIngredientes();
    this.loadReceta();
  }

  private loadPlato(): void {
    console.log('🔍 [RECETA] Cargando información del plato:', this.platoId);

    this.platoApi.obtener(this.platoId).subscribe({
      next: (plato: any) => {
        console.log('✅ [RECETA] Plato obtenido:', plato);

        this.platoNombre = plato?.nombre ?? `Plato #${this.platoId}`;

        // Validar que el plato esté activo
        const estado = plato?.estado ?? '';
        if (estado !== 'A') {
          console.warn('⚠️ [RECETA] El plato no está activo. Estado:', estado);
          this.notify.warning('Este plato no está activo. Solo se pueden crear recetas para platos activos.');
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ [RECETA] Error al cargar plato:', err);
        this.platoNombre = `Plato #${this.platoId}`;
        this.cdr.markForCheck();
      },
    });
  }

  private loadIngredientes(): void {
    console.log('🔍 [RECETA] Cargando lista de ingredientes');

    this.ingredientesApi.listar().subscribe({
      next: (arr) => {
        console.log('✅ [RECETA] Ingredientes recibidos:', arr);

        // Mapear todos los ingredientes
        this.ingredientes = (arr ?? []).map((ing: any) => ({
          id: Number(ing?.id ?? ing?.ingredienteId),
          nombre: ing?.nombre ?? '',
          codigo: ing?.codigo ?? '',
          aplicaComida: ing?.aplicaComida ?? ing?.aplica_comida ?? 'N',
          estado: ing?.estado ?? 'I',
        }));

        // Filtrar solo ingredientes válidos: activos Y que apliquen para comida
        this.ingredientesValidos = this.ingredientes
          .filter((ing) => ing.estado === 'A' && ing.aplicaComida === 'S')
          .map((ing) => ({
            id: ing.id,
            nombre: ing.nombre,
            codigo: ing.codigo,
          }));

        console.log('📊 [RECETA] Total ingredientes:', this.ingredientes.length);
        console.log('✅ [RECETA] Ingredientes válidos (activos + aplicaComida):', this.ingredientesValidos.length);

        if (this.ingredientesValidos.length === 0) {
          console.warn('⚠️ [RECETA] No hay ingredientes válidos para agregar a la receta');
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ [RECETA] Error al cargar ingredientes:', err);
      },
    });
  }

  private loadReceta(): void {
    console.log('🔍 [RECETA] Cargando receta del plato:', this.platoId);

    this.loading = true;
    this.cdr.markForCheck();

    this.api.obtenerReceta(this.platoId).subscribe({
      next: (items) => {
        console.log('✅ [RECETA] Receta obtenida:', items);

        this.items.clear();

        if (items && items.length > 0) {
          items.forEach((item: any) => {
            const itemGroup = new FormGroup({
              ingredienteId: new FormControl<number | null>(
                Number(item?.ingredienteId ?? item?.ingrediente_id ?? null),
                [Validators.required]
              ),
              cantidad: new FormControl<number>(
                Number(item?.cantidad ?? 1),
                [Validators.required, Validators.min(0.0001)]
              ),
            });
            this.items.push(itemGroup);
          });

          console.log('📋 [RECETA] Items cargados en formulario:', this.items.length);
        } else {
          console.log('📝 [RECETA] No hay items en la receta, agregando item vacío');
          this.agregarItem();
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ [RECETA] Error al cargar receta:', err);
        this.loading = false;
        this.agregarItem(); // Agregar un item vacío si falla
        this.cdr.markForCheck();
      },
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  agregarItem(): void {
    console.log('➕ [RECETA] Agregando nuevo item a la receta');

    const itemGroup = new FormGroup({
      ingredienteId: new FormControl<number | null>(null, [Validators.required]),
      cantidad: new FormControl<number>(1, [Validators.required, Validators.min(0.0001)]),
    });
    this.items.push(itemGroup);

    console.log('📋 [RECETA] Total de items:', this.items.length);
    this.cdr.markForCheck();
  }

  removerItem(index: number): void {
    console.log('🗑️ [RECETA] Removiendo item en índice:', index);

    const item = this.items.at(index);
    const ingredienteId = item?.get('ingredienteId')?.value;

    if (ingredienteId) {
      const ingrediente = this.ingredientesValidos.find((i) => i.id === ingredienteId);
      console.log('🔸 Ingrediente a remover:', ingrediente?.nombre);
    }

    this.items.removeAt(index);

    console.log('📋 [RECETA] Items restantes:', this.items.length);
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    console.log('💾 [RECETA] Iniciando guardado de receta');
    console.log('📋 [RECETA] Formulario válido:', this.form.valid);

    if (this.form.invalid) {
      console.warn('⚠️ [RECETA] Formulario inválido');
      this.form.markAllAsTouched();
      this.notify.warning('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }

    const value = this.form.value;
    const items: RecetaItemDTO[] = (value.items ?? [])
      .filter((item: any) => item.ingredienteId != null)
      .map((item: any) => ({
        ingredienteId: Number(item.ingredienteId),
        cantidad: Number(Number(item.cantidad).toFixed(3)), // Redondear a 3 decimales
      }));

    console.log('📤 [RECETA] Items a enviar:', items);

    // Validación 1: Verificar que hay al menos un item
    if (items.length === 0) {
      console.warn('⚠️ [RECETA] No hay items para guardar');
      this.notify.warning('Debe agregar al menos un ingrediente a la receta.');
      return;
    }

    // Validación 2: Verificar ingredientes duplicados
    const ingredientesIds = items.map((item) => item.ingredienteId);
    const duplicados = ingredientesIds.filter((id, index) => ingredientesIds.indexOf(id) !== index);

    if (duplicados.length > 0) {
      console.error('❌ [RECETA] Ingredientes duplicados encontrados:', duplicados);
      const nombresDuplicados = duplicados
        .map((id) => this.ingredientesValidos.find((ing) => ing.id === id)?.nombre)
        .filter((n) => n)
        .join(', ');
      this.notify.error(`Los siguientes ingredientes están duplicados: ${nombresDuplicados}. Cada ingrediente solo puede aparecer una vez en la receta.`);
      return;
    }

    // Validación 3: Verificar cantidades > 0
    const itemsConCantidadCero = items.filter((item) => item.cantidad <= 0);
    if (itemsConCantidadCero.length > 0) {
      console.error('❌ [RECETA] Items con cantidad <= 0:', itemsConCantidadCero);
      this.notify.error('Todas las cantidades deben ser mayores a 0 (mínimo 0.0001).');
      return;
    }

    console.log('✅ [RECETA] Validaciones del frontend pasadas');
    console.log('📊 [RECETA] Total de items:', items.length);
    console.log('💰 [RECETA] Cantidades:', items.map((i) => i.cantidad));

    this.loading = true;
    this.cdr.markForCheck();

    this.api.guardarReceta(this.platoId, items).subscribe({
      next: (response) => {
        console.log('✅ [RECETA] Receta guardada exitosamente:', response);
        this.notify.success('Receta guardada exitosamente');
        this.router.navigate(['/platos']);
      },
      error: (err) => {
        console.error('❌ [RECETA] Error al guardar receta:', err);
        this.notify.handleError(err, 'Error al guardar la receta');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/platos']);
  }

  getIngredienteNombre(ingredienteId: number): string {
    const ing = this.ingredientes.find((i) => i.id === ingredienteId);
    return ing ? `${ing.codigo} - ${ing.nombre}` : '';
  }
}
