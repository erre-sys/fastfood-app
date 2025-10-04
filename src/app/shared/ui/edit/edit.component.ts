import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './edit.component.html'
})
export class EditActionComponent {
  /** Ruta a la que navegar. Si no se define, emite (edit) */
  @Input() to?: string | any[] | null = null;

  /** Texto accesible (tooltip/aria) */
  @Input() ariaLabel = 'Editar';
  @Input() title?: string;

  /** Deshabilitar */
  @Input() disabled = false;

  /** Evento si no se usa routerLink */
  @Output() edit = new EventEmitter<void>();

  onClick(): void {
    if (!this.to) this.edit.emit();
  }
}
