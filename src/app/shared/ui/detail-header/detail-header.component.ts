import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DetailHeaderField {
  label: string;
  value: string | number | null | undefined;
  /** Color de acento usando design system tokens */
  tone?: 'brand' | 'accent' | 'success' | 'warn' | 'danger' | 'info';
  /** Formato especial para el valor */
  type?: 'text' | 'currency' | 'date' | 'badge';
  /** Clase de badge si type='badge' */
  badgeClass?: string;
}

@Component({
  selector: 'app-detail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-header.component.html',
})
export class DetailHeaderComponent {
  /** Título principal (ej: "Compra #123") */
  @Input() title?: string;

  /** Campos a mostrar */
  @Input() fields: DetailHeaderField[] = [];
}
