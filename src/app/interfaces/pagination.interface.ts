export interface Pager {
  page: number;
  size: number;
  orderBy: string;
  direction: 'asc' | 'desc';
}

export interface Filtro {
  llave: string;
  operacion: 'EQ' | 'LIKE' | 'IN' | 'NE' | 'GT' | 'LT' | 'GE' | 'LE' | '=' | '!=' | '>' | '<' | '>=' | '<=';
  valor?: any;
  valores?: any[];
}