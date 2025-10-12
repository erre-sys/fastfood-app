import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { NgIf } from '@angular/common';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

type TitleTone = 'brand' | 'success' | 'warn' | 'danger' | 'info';
type TitleVariant = 'plain' | 'tinted' | 'line';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  templateUrl: './title.component.html'
})
export class TitleComponent {
  @Input() titleLabel = '';
  @Input() subtitle?: string;

  /** muestra botón back */
  @Input() showBack = true;

  /** tamaño/espaciado */
  @Input() compact = false;

  /** variante visual */
  @Input() variant: TitleVariant = 'plain';

  /** tono para la variante tinted/line */
  @Input() tone: TitleTone = 'brand';

  @Output() cancel = new EventEmitter<void>();

  ArrowLeft = ArrowLeft;

  @HostBinding('class') get hostClass() {
    return `title ${this.compact ? 'title--compact' : ''} title--${this.variant}`;
  }

  /** expone una CSS var calculada con tus tokens */
  @HostBinding('style.--title-color') get cssTone() {
    switch (this.tone) {
      case 'success': return `rgb(var(--success-rgb))`;
      case 'warn':    return `rgb(var(--warning-rgb))`;
      case 'danger':  return `rgb(var(--danger-rgb))`;
      case 'info':    return `rgb(var(--info-rgb))`;
      case 'brand':
      default:        return `rgb(var(--brand-rgb))`;
    }
  }
}
