import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Calendar, X } from 'lucide-angular';

@Component({
  selector: 'app-date-range',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './date-range.component.html',
})
export class DateRangeComponent {
  private static idCounter = 0;

  @Input() labelFrom = 'Fecha Desde';
  @Input() labelTo = 'Fecha Hasta';
  @Input() valueFrom = '';
  @Input() valueTo = '';
  @Output() valueFromChange = new EventEmitter<string>();
  @Output() valueToChange = new EventEmitter<string>();

  @Input() hintFrom?: string;
  @Input() hintTo?: string;
  @Input() placeholderFrom = 'Seleccionar fecha';
  @Input() placeholderTo = 'Seleccionar fecha';

  @Input() disabled = false;
  @Input() required = false;
  @Input() soft = true;

  CalendarIcon = Calendar;
  XIcon = X;

  readonly idFrom: string;
  readonly idTo: string;

  rangeError = '';

  constructor() {
    const uniqueId = DateRangeComponent.idCounter++;
    this.idFrom = `date-from-${uniqueId}`;
    this.idTo = `date-to-${uniqueId}`;
  }

  onFromChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueFrom = input.value || '';
    this.validateRange();
    this.valueFromChange.emit(this.valueFrom);
  }

  onToChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueTo = input.value || '';
    this.validateRange();
    this.valueToChange.emit(this.valueTo);
  }

  private validateRange() {
    if (this.valueFrom && this.valueTo) {
      const from = new Date(this.valueFrom);
      const to = new Date(this.valueTo);

      if (from > to) {
        this.rangeError = 'La fecha desde no puede ser mayor que la fecha hasta';
      } else {
        this.rangeError = '';
      }
    } else {
      this.rangeError = '';
    }
  }

  clearFrom() {
    if (!this.valueFrom) return;
    this.valueFrom = '';
    this.rangeError = '';
    this.valueFromChange.emit('');
  }

  clearTo() {
    if (!this.valueTo) return;
    this.valueTo = '';
    this.rangeError = '';
    this.valueToChange.emit('');
  }
}
