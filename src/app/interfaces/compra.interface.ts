export interface CompraItem {
  id?: number;
  compraId?: number;
  ingredienteId: number;
  cantidad: number;
  costoUnitario: number;
  // Para mostrar en UI
  ingredienteNombre?: string;
  subtotal?: number;
}

export interface Compra {
  id: number;
  proveedorId: number;
  fecha: string;
  referencia: string | null;
  observaciones: string | null;
  items?: CompraItem[];
  // Para mostrar en UI
  proveedorNombre?: string;
  total?: number;
}

export interface CompraCreate {
  proveedorId: number;
  referencia?: string | null;
  observaciones?: string | null;
  items: CompraItemCreate[];
}

export interface CompraItemCreate {
  ingredienteId: number;
  cantidad: number;
  costoUnitario: number;
}

export interface CompraUpdate extends CompraCreate {
  id: number;
  items: CompraItemUpdate[];
}

export interface CompraItemUpdate extends CompraItemCreate {
  id?: number;
  compraId?: number;
}
