export type Estado = 'A' | 'I'; // Activo / Inactivo (ajusta si tu back usa otros)

export interface Proveedor {
  id: number;           // mapea proveedor_id → id en el front
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
  estado: Estado;
}

export type ProveedorCreate = Omit<Proveedor, 'id'>;

export interface Pagina<T> {
  contenido: T[];
  totalRegistros: number;
  paginaActual: number;  
  totalpaginas: number;
}

export interface PagerAndSort {
  page: number;
  size: number;
  sort?: string;
  orderBy: string;
  direction: 'asc' | 'desc';
}

/** Filtros genéricos: AJUSTA nombres según tu back */
export interface CriterioBusqueda {
  field: string;                       
  operator: 'EQ' | 'LIKE' | 'NEQ';     
  value: string | number | boolean;
}
