export type Align = 'left' | 'right' | 'center';
export type Dir = 'asc' | 'desc';
export type TableSort = { key: string; dir: Dir };
export type TabYesNo = 'all' | 'yes' | 'no';
export type TabStatus = 'all' | 'active' | 'inactive' | 'efectivo' | 'transfer';

export interface ColumnDef<Row = any> {
  key: string;
  header: string;
  widthPx?: number;
  align?: Align;
  sortable?: boolean;

  type?: 'text' | 'badge' | 'status' | 'date' | 'money';
  valueMap?: Record<string, string>;
  badgeMap?: Record<string, 'ok' | 'warn' | 'danger' | 'muted'>;

  format?: string;   
  currency?: string; 
  locale?: string;   
}
