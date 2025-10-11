import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Pencil } from 'lucide-angular';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, RouterLink, LucideAngularModule],
  templateUrl: './edit.component.html',
})
export class EditActionComponent {
  @Input() to?: string | any[];
  @Input() label = 'Editar';
  @Input() iconOnly = false;
  @Input() responsiveText = true;
  @Input() variant: 'primary' | 'cta' | 'outline' = 'primary';
  @Input() iconSize = 14;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() title?: string;

  @Output() clicked = new EventEmitter<void>();

  Pencil = Pencil;

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
