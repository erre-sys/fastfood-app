import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Banknote } from 'lucide-angular';

@Component({
  selector: 'app-pay',
  standalone: true,
  imports: [NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, RouterLink, LucideAngularModule],
  templateUrl: './pay.component.html'
})
export class PayActionComponent {
  /** Navegar o emitir evento */
  @Input() to?: string | any[];
  @Output() clickPay = new EventEmitter<void>();

  /** UI */
  @Input() label = 'Pagar';
  @Input() iconOnly = false;
  @Input() responsiveText = true;
  @Input() disabled = false;
  @Input() iconSize = 16;
  @Input() variant: 'primary' | 'warning' | 'ghost' = 'primary';

  /** Accesibilidad */
  @Input() ariaLabel?: string;
  @Input() title?: string;

  Banknote = Banknote;

  get variantClasses() {
    return {
      'btn--primary': this.variant === 'primary',
      'btn--warning': this.variant === 'warning',
      'btn--ghost': this.variant === 'ghost',
    };
  }

  emit() {
    if (!this.disabled) this.clickPay.emit();
  }

  preventWhenDisabled(ev: Event) {
    if (this.disabled) ev.preventDefault();
  }
}
