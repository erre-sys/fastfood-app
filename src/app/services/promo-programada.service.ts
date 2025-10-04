import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface PromoProgramada {
  promo_id: number;
  plato_id: number;
  fecha_inicio: string; // ISO o 'yyyy-MM-dd'
  fecha_fin: string;
  descuento_pct: number;
  estado: 'A'|'I';
  creado_por_sub?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PromoProgramadaService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/promo-programada`; // ajusta si tu endpoint difiere

  // tolerante a distintos nombres que pueda devolver el back
  private pick<T=any>(o:any, keys:string[], fallback:any=null): any {
    for (const k of keys) if (o && o[k] !== undefined && o[k] !== null) return o[k];
    return fallback;
  }
  private normalize = (r:any): PromoProgramada => ({
    promo_id: Number(this.pick(r, ['promo_id','promoId','id'], -1)),
    plato_id: Number(this.pick(r, ['plato_id','platoId'], 0)),
    fecha_inicio: String(this.pick(r, ['fecha_inicio','fechaInicio'], '')),
    fecha_fin: String(this.pick(r, ['fecha_fin','fechaFin'], '')),
    descuento_pct: Number(this.pick(r, ['descuento_pct','descuentoPct','descuento'], 0)),
    estado: (this.pick(r, ['estado'], 'A') as 'A'|'I'),
    creado_por_sub: this.pick(r, ['creado_por_sub','creadoPorSub'], null),
  });

  listar(): Observable<PromoProgramada[]> {
    return this.http.get<any[]>(this.base).pipe(
      map(arr => (arr ?? []).map(this.normalize))
    );
  }
}
