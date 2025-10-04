import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @Input() ariaLabel = 'Buscar';
  @Input() placeholder = 'Buscar...';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  onInput(v: string) {
    this.value = v ?? '';
    this.valueChange.emit(this.value);
  }
  clear() {
    this.value = '';
    this.valueChange.emit('');
  }
}
