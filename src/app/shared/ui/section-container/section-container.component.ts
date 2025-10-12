import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';

type Accent = 'brand' | 'success' | 'warn' | 'danger' | 'info';

let SEC_ID = 0;

@Component({
  selector: 'app-section-container',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet],
  templateUrl: './section-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionContainerComponent {
  /** Título y descripción (opcionales) */
  @Input() heading?: string;
  @Input() description?: string;

  /** Acento visual (opcional) */
  @Input() accent?: Accent | null = null;

  /** Densidad/separadores (opcionales) */
  @Input() compact = false;
  @Input() inset = false;
  @Input() divider = false;

  /** Cabecera sticky dentro de la página (opcional) */
  @Input() sticky = false;

  /** Slot de acciones (botones, filtros…) */
  @Input() actionsTpl?: TemplateRef<any>;

  /** Accesibilidad */
  headingId = `sec-${++SEC_ID}`;
  @HostBinding('attr.aria-labelledby') get ariaLabelledby() { return this.heading ? this.headingId : null; }
  @HostBinding('attr.role') role = 'region';

  /** Host classes y data-accent */
  @HostBinding('class') hostClass = 'card section';
  @HostBinding('class.section--compact') get isCompact() { return this.compact; }
  @HostBinding('class.section--inset')   get isInset()   { return this.inset; }
  @HostBinding('class.section--divider') get isDivider() { return this.divider; }
  @HostBinding('attr.data-accent') get dataAccent() { return this.accent ?? null; }
}
