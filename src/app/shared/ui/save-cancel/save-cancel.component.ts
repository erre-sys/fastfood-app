import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-save-cancel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-cancel.component.html',
})
export class SaveCancelComponent {
  /** Textos */
  @Input() saveLabel = 'Guardar';
  @Input() cancelLabel = 'Cancelar';
  @Input() deleteLabel = 'Eliminar';
  @Input() sticky = false;

  /** Estados */
  @Input() loading = false;
  @Input() disabled = false;

  /** Mostrar/ocultar botones */
  @Input() showDelete = false;

  /** Diseño: end | between */
  @Input() align: 'end' | 'between' = 'end';

  /** Eventos (solo se usan si pones type="button") */
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
