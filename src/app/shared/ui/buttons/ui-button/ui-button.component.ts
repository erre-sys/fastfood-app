import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
type Size = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgIf, RouterLink, LucideAngularModule],
  templateUrl: './ui-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiButtonComponent {
  /** Navegación / comportamiento */
  @Input() to?: string | any[];
  @Input() href?: string;
  @Input() target: '_self' | '_blank' = '_self';
  @Input() rel?: string;
  @Output() clicked = new EventEmitter<MouseEvent>();

  /** UI */
  @Input() label = 'Acción';
  @Input() icon?: LucideIconData;
  @Input() trailingIcon = false;
  @Input() iconOnly = false;

  @Input() variant: Variant = 'secondary';
  @Input() size: Size = 'md';

  @Input() disabled = false;
  @Input() loading = false;
  @Input() responsiveText = true;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Accesibilidad */
  @Input() ariaLabel?: string;
  @Input() title?: string;
  @Input() ariaExpanded: boolean | null = null;
  @Input() dataTestId?: string;

  /** Mapa de icon-size automático por tamaño */
  private readonly sizeToIcon: Record<Size, number> = { xs: 14, sm: 16, md: 18, lg: 20 };
  get iconPx(): number { return this.sizeToIcon[this.size]; }

  get computedAriaLabel(): string { return this.ariaLabel || this.label; }
  get computedTitle(): string | null { return this.title || this.ariaLabel || this.label || null; }
  get relAttr(): string | null { return this.rel ?? (this.target === '_blank' ? 'noopener noreferrer' : null); }

  onClick(ev: MouseEvent) {
    if (this.disabled || this.loading) { ev.preventDefault(); ev.stopPropagation(); return; }
    this.clicked.emit(ev);
  }
}
