import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  templateUrl: './title.component.html'
})
export class TitleComponent {
  @Input() titleLabel = '';
  @Input() subtitle?: string;
  @Input() showBack = true; 
  @Output() cancel = new EventEmitter<void>();

  ArrowLeft = ArrowLeft;
  
}
