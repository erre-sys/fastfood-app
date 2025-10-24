import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PedidoService } from '../../../services/pedido.service';
import { PagoClienteService } from '../../../services/pago-cliente.service';
import { Pedido, EstadoPedido } from '../../../interfaces/pedido.interface';
import { PagoClienteCreate, MetodoPago, PagoCliente } from '../../../interfaces/pago-cliente.interface';
import { NotifyService } from '../../../core/notify/notify.service';
import { authService } from '../../../core/auth/auth.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { PageLayoutComponent } from '../../../shared/ui/page-layout/page-layout.component';
import { TitleComponent } from '../../../shared/ui/fields/title/title.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { SearchComponent } from '../../../shared/ui/fields/searchbox/search.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { TabsFilterComponent } from '../../../shared/ui/tabs-filter/tabs-filter.component';
import { SectionContainerComponent } from '../../../shared/ui/section-container/section-container.component';
import { LucideAngularModule, Eye, Plus, Check, X as XIcon, DollarSign } from 'lucide-angular';
import { UiButtonComponent } from '../../../shared/ui/buttons/ui-button/ui-button.component';
import { ColumnDef, Dir, TableSort, TabStatus } from '../../../shared/ui/table/column-def';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageLayoutComponent,
    TitleComponent,
    TableComponent,
    SearchComponent,
    PaginatorComponent,
    TabsFilterComponent,
    SectionContainerComponent,
    LucideAngularModule,
    UiButtonComponent,
  ],
  templateUrl: './pedido.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidosListPage implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  private api = inject(PedidoService);
  private pagoApi = inject(PagoClienteService);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotifyService);

  titleLabel = 'Pedidos';
  subTitleLabel = 'Gestión de pedidos';

  // UI
  tab: TabStatus | 'C' | 'L' | 'E' | 'A' = 'all';
  sortKey: string = 'id';
  sortDir: Dir = 'desc';
  page = 0;
  pageSize = 10;

  loading = false;
  total = 0;
  rows: Pedido[] = [];

  // Íconos
  Eye = Eye;
  Plus = Plus;
  Check = Check;
  XIcon = XIcon;
  DollarSign = DollarSign;

  searchForm = new FormGroup({
    q: new FormControl<string>('', { nonNullable: true }),
    fechaDesde: new FormControl<string>('', { nonNullable: true }),
    fechaHasta: new FormControl<string>('', { nonNullable: true }),
  });

  columns: ColumnDef<Pedido>[] = [
    { key: 'id', header: 'ID', sortable: true, widthPx: 80 },
    { key: 'creadoEn', header: 'Fecha', sortable: true, type: 'date', widthPx: 200 },
    { key: 'estado', header: 'Estado', widthPx: 120, align: 'center',
      type: 'badge',
      badgeMap: {
        C: 'warn',    // Creado
        L: 'muted',   // Listo
        E: 'ok',      // Entregado
        A: 'danger'   // Anulado
      },
      valueMap: {
        C: 'Creado',
        L: 'Listo',
        E: 'Entregado',
        A: 'Anulado'
      }
    },
    { key: 'totalNeto', header: 'Total', align: 'right', widthPx: 120, type: 'money' },
    { key: 'montoPendiente', header: 'Pendiente', align: 'right', widthPx: 120, type: 'money' },
  ];

  counters = {
    all: 0,
    C: undefined as number | undefined,
    L: undefined as number | undefined,
    E: undefined as number | undefined,
    A: undefined as number | undefined,
  };

  ngOnInit(): void {
    this.searchForm.controls.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    this.searchForm.controls.fechaDesde.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    this.searchForm.controls.fechaHasta.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private load(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const filtros: any[] = [];
    if (this.tab === 'C') filtros.push({ llave: 'estado', operacion: '=', valor: 'C' });
    if (this.tab === 'L') filtros.push({ llave: 'estado', operacion: '=', valor: 'L' });
    if (this.tab === 'E') filtros.push({ llave: 'estado', operacion: '=', valor: 'E' });
    if (this.tab === 'A') filtros.push({ llave: 'estado', operacion: '=', valor: 'A' });

    const term = this.searchForm.controls.q.value.trim();
    if (term) {
      const n = Number(term);
      if (!Number.isNaN(n)) {
        filtros.push({ llave: 'id', operacion: 'EQ', valor: n });
      }
    }

    const fechaDesde = this.searchForm.controls.fechaDesde.value.trim();
    if (fechaDesde) {
      filtros.push({ llave: 'creadoEn', operacion: '>=', valor: fechaDesde });
    }

    const fechaHasta = this.searchForm.controls.fechaHasta.value.trim();
    if (fechaHasta) {
      filtros.push({ llave: 'creadoEn', operacion: '<=', valor: fechaHasta });
    }

    const pager = { page: this.page, size: this.pageSize, sortBy: this.sortKey, direction: this.sortDir };

    this.api
      .buscarPaginado(pager, filtros)
      .subscribe({
        next: (p) => {
          const contenido = (p?.contenido ?? []) as any[];
          const pedidos = contenido.map((r: any) => ({
            id: Number(r?.id ?? -1),
            estado: (r?.estado ?? 'C') as EstadoPedido,
            totalBruto: Number(r?.totalBruto ?? r?.total_bruto ?? 0),
            totalExtras: Number(r?.totalExtras ?? r?.total_extras ?? 0),
            totalNeto: Number(r?.totalNeto ?? r?.total_neto ?? 0),
            observaciones: r?.observaciones ?? '',
            entregadoPorSub: r?.entregadoPorSub ?? r?.entregado_por_sub ?? '',
            creadoEn: r?.creadoEn ?? r?.creado_en ?? '',
            actualizadoEn: r?.actualizadoEn ?? r?.actualizado_en ?? '',
            entregadoEn: r?.entregadoEn ?? r?.entregado_en ?? '',
          })) as Pedido[];

          // Cargar pagos para cada pedido entregado
          this.cargarPagosPedidos(pedidos);

          this.total = Number(p?.totalRegistros ?? pedidos.length);
          this.counters.all = this.total;
        },
        error: (err) => {
          console.error('Error al consultar pedidos:', err);
          this.notify.handleError(err, 'Error al cargar pedidos');
          this.rows = [];
          this.total = 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Cargar información de pagos para los pedidos entregados
   */
  private cargarPagosPedidos(pedidos: Pedido[]): void {
    // Solo cargar pagos para pedidos entregados
    const pedidosEntregados = pedidos.filter(p => p.estado === 'E');

    if (pedidosEntregados.length === 0) {
      this.rows = pedidos;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    // Crear array de observables para cargar pagos de cada pedido
    const pagoRequests = pedidosEntregados.map(pedido =>
      this.pagoApi.obtenerPorPedido(pedido.id).pipe(
        map((pagos: PagoCliente[]) => ({ pedidoId: pedido.id, pagos })),
        catchError(err => {
          console.error(`Error al cargar pagos del pedido ${pedido.id}:`, err);
          return of({ pedidoId: pedido.id, pagos: [] });
        })
      )
    );

    // Ejecutar todas las peticiones en paralelo
    forkJoin(pagoRequests).subscribe({
      next: (resultados) => {

        // Crear un mapa de pedidoId -> pagos
        const pagosPorPedido = new Map<number, PagoCliente[]>();
        resultados.forEach(r => pagosPorPedido.set(r.pedidoId, r.pagos));

        // Actualizar pedidos con información de pagos
        this.rows = pedidos.map(pedido => {
          if (pedido.estado !== 'E') {
            return pedido;
          }

          const pagos = pagosPorPedido.get(pedido.id) || [];
          // Solo sumar pagos aprobados (estado P)
          const totalPagado = pagos
            .filter(pago => pago.estado === 'P')
            .reduce((sum, pago) => sum + pago.montoTotal, 0);

          const montoPendiente = pedido.totalNeto - totalPagado;


          return {
            ...pedido,
            totalPagado,
            montoPendiente,
          };
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[PEDIDOS] Error al cargar pagos:', err);
        this.rows = pedidos;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // Handlers UI
  setTab(k: TabStatus | 'C' | 'L' | 'E' | 'A') {
    if (this.tab !== k) {
      this.tab = k;
      this.page = 0;
      this.load();
    }
  }

  onSort(s: TableSort) {
    if (!s?.key) return;
    this.sortKey = s.key;
    this.sortDir = s.dir as Dir;
    this.page = 0;
    this.load();
  }

  setPageSize(n: number) {
    if (n > 0 && n !== this.pageSize) {
      this.pageSize = n;
      this.page = 0;
      this.load();
    }
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  next() {
    if (this.page + 1 < this.maxPage()) {
      this.page++;
      this.load();
    }
  }

  maxPage() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  from() {
    return this.total ? this.page * this.pageSize + 1 : 0;
  }

  to() {
    return Math.min((this.page + 1) * this.pageSize, this.total);
  }

  goBack() {
    history.back();
  }

  onSearch(term: string) {
    this.searchForm.controls.q.setValue(term, { emitEvent: true });
  }

  /**
   * Marcar pedido como listo (C -> L) - NO descuenta inventario
   */
  onMarcarListo(pedido: Pedido) {
    if (pedido.estado !== 'C') {
      this.notify.warning('Solo se puede marcar como listo pedidos en estado Creado');
      return;
    }

    if (confirm(`¿Marcar pedido #${pedido.id} como Listo?`)) {
      this.api.marcarListo(pedido.id).subscribe({
        next: () => {
          this.notify.success(`Pedido #${pedido.id} marcado como Listo`);
          this.load();
        },
        error: (err) => {
          console.error('Error al marcar como listo:', err);
          this.notify.handleError(err, 'Error al marcar como listo');
        },
      });
    }
  }

  /**
   * Entregar pedido (L -> E) - SÍ descuenta inventario, valida stock
   */
  onEntregar(pedido: Pedido) {
    if (pedido.estado !== 'L') {
      this.notify.warning('Solo se puede entregar pedidos que estén Listos');
      return;
    }

    if (confirm(`¿Entregar pedido #${pedido.id}? Esto descontará el inventario.`)) {
      this.api.entregar(pedido.id).subscribe({
        next: () => {
          this.notify.success(`Pedido #${pedido.id} entregado correctamente`);
          this.load();
        },
        error: (err) => {
          console.error('Error al entregar pedido:', err);
          this.notify.handleError(err, 'Error al entregar pedido');
        },
      });
    }
  }

  /**
   * Anular pedido (C o L -> A)
   */
  onAnular(pedido: Pedido) {
    if (pedido.estado === 'E' || pedido.estado === 'A') {
      this.notify.warning('No se pueden anular pedidos Entregados o ya Anulados');
      return;
    }

    if (confirm(`¿ANULAR pedido #${pedido.id}? Esta acción no se puede deshacer.`)) {
      this.api.anular(pedido.id).subscribe({
        next: () => {
          this.notify.success(`Pedido #${pedido.id} anulado`);
          this.load();
        },
        error: (err) => {
          console.error('Error al anular pedido:', err);
          this.notify.handleError(err, 'Error al anular pedido');
        },
      });
    }
  }

  /**
   * Registrar pago para pedido entregado (solo E)
   */
  onPagar(pedido: Pedido) {
    if (pedido.estado !== 'E') {
      this.notify.warning('Solo se pueden registrar pagos para pedidos Entregados');
      return;
    }

    // Solicitar método de pago
    const metodoInput = prompt(
      `Registrar pago para pedido #${pedido.id} (Total: $${pedido.totalNeto.toFixed(2)})\n\n` +
      'Método de pago (1=EFECTIVO, 2=TARJETA, 3=TRANSFERENCIA, 4=DEPOSITO):'
    );

    if (!metodoInput) {
      return;
    }

    const metodoMap: Record<string, MetodoPago> = {
      '1': 'EFECTIVO',
      '2': 'TARJETA',
      '3': 'TRANSFERENCIA',
      '4': 'DEPOSITO',
    };

    const metodo = metodoMap[metodoInput.trim()];
    if (!metodo) {
      this.notify.warning('Método de pago inválido. Use: 1, 2, 3 o 4');
      return;
    }

    // Solicitar monto
    const montoInput = prompt(`Monto a pagar (Total pedido: $${pedido.totalNeto.toFixed(2)}):`);
    if (!montoInput) {
      return;
    }

    const monto = Number(montoInput);
    if (isNaN(monto) || monto <= 0) {
      this.notify.warning('El monto debe ser mayor a 0');
      return;
    }

    if (monto > pedido.totalNeto) {
      if (!confirm(`El monto ($${monto.toFixed(2)}) es mayor al total del pedido ($${pedido.totalNeto.toFixed(2)}). ¿Continuar?`)) {
        return;
      }
    }

    // Solicitar referencia (opcional)
    const referencia = prompt('Referencia (opcional):') || undefined;

    // Obtener el sub del usuario autenticado
    const userSub = authService.getSub();

    const dto: PagoClienteCreate = {
      pedidoId: pedido.id,
      montoTotal: monto,
      metodo: metodo,
      referencia: referencia,
      creadoPorSub: userSub,
    };

    this.pagoApi.crear(dto).subscribe({
      next: (response) => {
        this.notify.success(`Pago registrado correctamente (ID: ${response.id})`);
        this.load();
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        this.notify.handleError(err, 'Error al registrar pago');
      },
    });
  }
}
