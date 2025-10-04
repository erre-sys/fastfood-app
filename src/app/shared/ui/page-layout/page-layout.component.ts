import { Component, Input, TemplateRef } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';

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
  @Input() stickyHeader = false;
}