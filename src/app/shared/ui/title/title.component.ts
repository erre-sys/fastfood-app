import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [NgIf],
  templateUrl: './title.component.html'
})
export class TitleComponent {
  @Input() titleLabel = '';
  @Input() subtitle?: string;
  @Input() showBack = true; 
  @Output() cancel = new EventEmitter<void>();
}
