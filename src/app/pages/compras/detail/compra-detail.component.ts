import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CompraService } from '../../../services/compra.service';
import { ProveedoresService } from '../../../services/proveedores.service';
import { IngredienteService } from '../../../services/ingrediente.service';
import { Compra, CompraItem } from '../../../interfaces/compra.interface';
import { ColumnDef } from '../../../shared/ui/table/column-def';

import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { DetailHeaderComponent, DetailHeaderField } from '../../../shared/ui/detail-header/detail-header.component';
import { SummaryComponent } from '../../../shared/ui/summary/summary.component';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';

@Component({
  selector: 'app-compra-detail',
  standalone: true,
  imports: [
    CommonModule,
    SectionContainerComponent,
    TableComponent,
    DetailHeaderComponent,
    SummaryComponent,
    UiButtonComponent,
  ],
  templateUrl: './compra-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CompraDetailPage implements OnInit {
  private api = inject(CompraService);
  private proveedoresApi = inject(ProveedoresService);
  private ingredientesApi = inject(IngredienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  compra: Compra | null = null;
  proveedorNombre: Map<number, string> = new Map();
  ingredienteNombre: Map<number, string> = new Map();

  headerFields: DetailHeaderField[] = [];

  itemsColumns: ColumnDef<CompraItem>[] = [
    { key: 'ingredienteNombre', header: 'Ingrediente', widthPx: 400 },
    { key: 'cantidad', header: 'Cantidad', align: 'center', widthPx: 150 },
    { key: 'costoUnitario', header: 'Costo Unitario', align: 'center', type: 'money', widthPx: 180 },
    { key: 'subtotal', header: 'Subtotal', align: 'right', type: 'money', widthPx: 180 },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadData(id);
    }
  }

  private loadData(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Primero cargamos proveedores e ingredientes, luego la compra
    forkJoin({
      proveedores: this.proveedoresApi.listar(),
      ingredientes: this.ingredientesApi.listar(),
    }).subscribe({
      next: ({ proveedores, ingredientes }) => {
        // Cargar Maps
        this.proveedorNombre = new Map(
          (proveedores ?? []).map((prov: any) => [Number(prov?.id ?? prov?.proveedorId), prov?.nombre ?? ''])
        );
        this.ingredienteNombre = new Map(
          (ingredientes ?? []).map((ing: any) => [Number(ing?.id ?? ing?.ingredienteId), ing?.nombre ?? ''])
        );

        // Ahora sí cargamos la compra
        this.loadCompra(id);
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/compras']);
      },
    });
  }

  private loadCompra(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.api.obtener(id).subscribe({
      next: (r) => {
        const items = (r?.items ?? r?.compraItems ?? []).map((item: any) => {
          const ingId = Number(item?.ingredienteId ?? item?.ingrediente_id ?? -1);
          return {
            id: Number(item?.id ?? -1),
            compraId: Number(item?.compraId ?? item?.compra_id ?? id),
            ingredienteId: ingId,
            cantidad: Number(item?.cantidad ?? 0),
            costoUnitario: Number(item?.costoUnitario ?? item?.costo_unitario ?? 0),
            ingredienteNombre: this.getIngredienteNombre(ingId),
            subtotal: Number(item?.cantidad ?? 0) * Number(item?.costoUnitario ?? item?.costo_unitario ?? 0),
          };
        });

        const provId = Number(r?.proveedorId ?? r?.proveedor_id ?? -1);
        const total = items.reduce((sum: any, item: { subtotal: any; }) => sum + item.subtotal, 0);

        this.compra = {
          id: Number(r?.id ?? r?.compraId ?? -1),
          proveedorId: provId,
          fecha: r?.fecha ?? '',
          referencia: r?.referencia ?? null,
          observaciones: r?.observaciones ?? null,
          items,
          proveedorNombre: this.getProveedorNombre(provId),
          total,
        };

        // Configurar campos de la cabecera
        this.headerFields = [
          { label: 'Fecha', value: this.compra.fecha, type: 'date', tone: 'success' },
          { label: 'Proveedor', value: this.compra.proveedorNombre || 'N/A', tone: 'brand' },
        ];

        if (this.compra.referencia) {
          this.headerFields.push({
            label: 'Referencia',
            value: this.compra.referencia,
            tone: 'warn',
          });
        }

        if (this.compra.observaciones) {
          this.headerFields.push({
            label: 'Observaciones',
            value: this.compra.observaciones,
            tone: 'info',
          });
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/compras']);
      },
    });
  }

  private getProveedorNombre(id: number): string {
    return this.proveedorNombre.get(id) ?? '';
  }

  private getIngredienteNombre(id: number): string {
    return this.ingredienteNombre.get(id) ?? '';
  }

  goBack(): void {
    this.router.navigate(['/compras']);
  }
}
