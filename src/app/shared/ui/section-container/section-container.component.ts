import { ChangeDetectionStrategy, Component, Input, TemplateRef, HostBinding } from '@angular/core';
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
  /** Título de la sección (opcional) */
  @Input() heading?: string;

  /** Descripción bajo el título (opcional) */
  @Input() description?: string;

  /** Acento visual (opcional): brand | success | warn | danger | info */
  @Input() accent?: Accent | null = null;

  /** Variantes de densidad/separadores (opcionales) */
  @Input() compact = false;
  @Input() inset = false;
  @Input() divider = false;

  /** Slot opcional de acciones en el header */
  @Input() actionsTpl?: TemplateRef<any>; // <- TemplateRef<any> para evitar fricciones

  /** id accesible para el título */
  headingId = `sec-${++SEC_ID}`;

  // ---- Host bindings para no forzar clases desde el uso
  @HostBinding('class') hostClass = 'card section';
  @HostBinding('class.section--compact') get isCompact() { return this.compact; }
  @HostBinding('class.section--inset')   get isInset()   { return this.inset; }
  @HostBinding('class.section--divider') get isDivider() { return this.divider; }

  @HostBinding('attr.data-accent') get dataAccent() { return this.accent ?? null; }

  @HostBinding('attr.aria-labelledby') get ariaLabelledby() {
    return this.heading ? this.headingId : null;
  }

  @HostBinding('attr.role') role = 'region';
}
