import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, RouterLink, LucideAngularModule],
  templateUrl: './new.component.html',
})
export class NewActionComponent {
  @Input() to?: string | any[];
  
  @Input() label = 'Nuevo';

  @Input() iconOnly = false;

  @Input() responsiveText = true;

  @Input() variant: 'primary' | 'cta' | 'outline' = 'primary';

  @Input() iconSize: number = 16;

  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() title?: string;

  @Output() clicked = new EventEmitter<void>();

  Plus = Plus;

  get variantClasses() {
    return {
      'btn--primary': this.variant === 'primary',
      'btn--cta': this.variant === 'cta',
      'btn--outline-primary': this.variant === 'outline',
    };
  }

  emit() { if (!this.disabled) this.clicked.emit(); }

  preventWhenDisabled(e: MouseEvent) {
    if (this.disabled) { e.preventDefault(); e.stopImmediatePropagation(); }
  }
}
