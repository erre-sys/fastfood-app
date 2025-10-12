import { Component, Input, TemplateRef } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';

type WidthMode = 'default' | 'narrow' | 'wide' | 'full';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet],
  templateUrl: './page-layout.component.html'
})
export class PageLayoutComponent {
  @Input() headerTemplate?: TemplateRef<unknown>;
  @Input() contentTemplate?: TemplateRef<unknown>;
  @Input() footerTemplate?: TemplateRef<unknown>;

  /** Hace sticky el header de página bajo el header global */
  @Input() stickyHeader = false;

  /** Controla el ancho del contenedor interno */
  @Input() width: WidthMode = 'default';
}
