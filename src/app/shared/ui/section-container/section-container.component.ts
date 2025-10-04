import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-section-container',
  standalone: true,
  imports: [NgIf],
  // Evitamos que el atributo nativo title quede en el host (y saque el tooltip)
  host: { '[attr.title]': 'null' },
  templateUrl: './section-container.component.html',
})
export class SectionContainerComponent {
  /** Nuevo nombre: heading */
  @Input() heading = '';
  @Input() description = '';

  /** Compatibilidad: si alguien usa [title] lo mapeamos a heading */
  @Input('title') set titleCompat(v: string) {
    this.heading = v;
  }
}
