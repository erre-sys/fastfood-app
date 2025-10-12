import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { LucideAngularModule, Search as SearchIcon, X as XIcon } from 'lucide-angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @Input() ariaLabel = 'Buscar';
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();    

  @Input() id = `srch-${Math.random().toString(36).slice(2, 8)}`;

  // estados opcionales
  @Input() disabled = false;
  @Input() busy = false;

  SearchIco = SearchIcon;
  XIcon = XIcon;

  onInput(v: string) {
    this.value = v ?? '';
    this.valueChange.emit(this.value);
  }
  clear() {
    if (!this.value) return;
    this.value = '';
    this.valueChange.emit('');
    this.cleared.emit();
  }
}
