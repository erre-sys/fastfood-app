import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InventarioService } from '../../../services/inventario.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { AjusteInventario } from '../../../interfaces/inventario.interface';
import { NotifyService } from '../../../core/notify/notify.service';
import { forkJoin } from 'rxjs';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { AppSelectComponent } from '../../../shared/ui/fields/select/select.component';
import { InputComponent } from '../../../shared/ui/fields/input/input.component';
import { SaveCancelComponent } from '../../../shared/ui/buttons/ui-button-save-cancel/save-cancel.component';
import { LucideAngularModule, Plus, Minus } from 'lucide-angular';

@Component({
  selector: 'app-ajuste-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionContainerComponent,
    AppSelectComponent,
    InputComponent,
    SaveCancelComponent,
    LucideAngularModule,
  ],
  templateUrl: './ajuste-inventario.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AjusteInventarioPage implements OnInit {
  private api = inject(InventarioService);
  private ingredientesApi = inject(IngredienteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  // Íconos
  Plus = Plus;
  Minus = Minus;

  loading = false;
  ingredientes: Array<{ id: number; nombre: string; codigo: string; stockActual: number; unidad: string }> = [];

  tiposAjuste = [
    { value: 'SUMAR', label: 'Sumar Stock (Entrada)' },
    { value: 'RESTAR', label: 'Restar Stock (Salida/Merma)' },
  ];

  form = new FormGroup({
    ingredienteId: new FormControl<number | null>(null, [Validators.required]),
    tipoAjuste: new FormControl<string>('SUMAR', [Validators.required]),
    cantidad: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    referencia: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadIngredientes();
  }

  private loadIngredientes(): void {
    console.log('[AJUSTE-INVENTARIO] Cargando ingredientes e inventario');

    // Cargar ingredientes e inventario en paralelo
    forkJoin({
      ingredientes: this.ingredientesApi.listar(),
      inventario: this.api.buscarInventarioPaginado(
        { page: 0, size: 1000, sortBy: 'nombre', direction: 'asc' },
        undefined,
        false
      ),
    }).subscribe({
      next: ({ ingredientes, inventario }) => {
        console.log('[AJUSTE-INVENTARIO] Ingredientes recibidos:', ingredientes?.length);
        console.log('[AJUSTE-INVENTARIO] Items de inventario recibidos:', inventario?.contenido?.length);

        // Filtrar solo ingredientes activos y crear un Map por ID para acceso rápido
        const ingredientesActivos = (ingredientes ?? []).filter(
          (ing: any) => (ing?.estado ?? 'A') === 'A'
        );

        console.log('[AJUSTE-INVENTARIO] Ingredientes activos:', ingredientesActivos.length);

        const ingredientesMap = new Map(
          ingredientesActivos.map((ing: any) => {
            // Usar la misma lógica que el servicio de ingredientes para extraer el ID
            const ingId = ing?.id ?? ing?.ingredienteId ?? ing?.ingrediente_id;
            return [
              Number(ingId),
              {
                nombre: ing?.nombre ?? '',
                codigo: ing?.codigo ?? '',
                unidad: ing?.unidad ?? 'UND',
              },
            ];
          })
        );

        console.log('[AJUSTE-INVENTARIO] Map de ingredientes creado:', ingredientesMap.size, 'items');
        console.log('[AJUSTE-INVENTARIO] Primeros 3 IDs en el Map:', Array.from(ingredientesMap.keys()).slice(0, 3));

        // Combinar datos de inventario con datos de ingredientes
        // Solo incluir ingredientes que estén activos
        const inventarioArr = inventario.contenido ?? inventario.content ?? [];
        this.ingredientes = (inventarioArr ?? [])
          .map((inv: any, index: number) => {
            // Extraer el ingredienteId del inventario
            const ingredienteId = Number(inv?.ingredienteId ?? inv?.ingrediente_id ?? inv?.id);
            const ingredienteData = ingredientesMap.get(ingredienteId);

            if (index < 3) {
              console.log(`[AJUSTE-INVENTARIO] Procesando item ${index}:`, {
                ingredienteId,
                invRaw: inv,
                ingredienteData,
                encontrado: ingredientesMap.has(ingredienteId),
              });
            }

            return {
              id: ingredienteId,
              nombre: ingredienteData?.nombre ?? '',
              codigo: ingredienteData?.codigo ?? '',
              stockActual: Number(inv?.stockActual ?? inv?.stock_actual ?? 0),
              unidad: ingredienteData?.unidad ?? 'UND',
            };
          })
          .filter((ing) => ing.nombre !== ''); // Filtrar ingredientes sin nombre (inactivos)

        console.log('[AJUSTE-INVENTARIO] Ingredientes procesados:', this.ingredientes.length);
        if (this.ingredientes.length > 0) {
          console.log('[AJUSTE-INVENTARIO] Ejemplo primer ingrediente:', this.ingredientes[0]);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[AJUSTE-INVENTARIO] Error al cargar datos:', err);
        this.notify.handleError(err, 'Error al cargar ingredientes e inventario');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.warning('Por favor complete todos los campos requeridos');
      return;
    }

    const value = this.form.value;
    const tipoAjuste = value.tipoAjuste as string;
    const cantidadBase = Number(value.cantidad);

    // Si es RESTAR, convertir a negativo
    const cantidadFinal = tipoAjuste === 'RESTAR' ? -cantidadBase : cantidadBase;

    const ajuste: AjusteInventario = {
      ingredienteId: Number(value.ingredienteId),
      cantidad: cantidadFinal,
      referencia: value.referencia?.trim() || undefined,
    };

    console.log('[AJUSTE-INVENTARIO] Ajuste a enviar:', ajuste);

    // Validación adicional: si va a restar, verificar stock
    const ingrediente = this.ingredientes.find(i => i.id === ajuste.ingredienteId);
    if (ingrediente && cantidadFinal < 0) {
      const stockDespues = ingrediente.stockActual + cantidadFinal;
      if (stockDespues < 0) {
        this.notify.warning(
          `Stock insuficiente. Stock actual: ${ingrediente.stockActual}, Intentando restar: ${Math.abs(cantidadFinal)}`
        );
        return;
      }
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.api.ajustar(ajuste).subscribe({
      next: () => {
        console.log('[AJUSTE-INVENTARIO] Ajuste realizado exitosamente');
        const accion = cantidadFinal > 0 ? 'sumado' : 'restado';
        this.notify.success(`Inventario ajustado: ${accion} ${Math.abs(cantidadFinal)} unidades`);
        this.router.navigate(['/inventario/stock']);
      },
      error: (err) => {
        console.error('[AJUSTE-INVENTARIO] Error al ajustar inventario:', err);
        this.notify.handleError(err, 'Error al ajustar inventario');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/inventario/stock']);
  }

  getStockActual(): number {
    const ingredienteId = this.form.controls.ingredienteId.value;
    if (!ingredienteId) return 0;
    const ingrediente = this.ingredientes.find(i => i.id === ingredienteId);
    return ingrediente?.stockActual ?? 0;
  }

  getUnidad(): string {
    const ingredienteId = this.form.controls.ingredienteId.value;
    if (!ingredienteId) return '';
    const ingrediente = this.ingredientes.find(i => i.id === ingredienteId);
    return ingrediente?.unidad ?? '';
  }

  calcularStockResultante(): number {
    const stockActual = this.getStockActual();
    const tipoAjuste = this.form.controls.tipoAjuste.value;
    const cantidad = this.form.controls.cantidad.value || 0;

    if (tipoAjuste === 'RESTAR') {
      return stockActual - cantidad;
    } else {
      return stockActual + cantidad;
    }
  }
}
