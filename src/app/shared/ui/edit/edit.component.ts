import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { LucideAngularModule, Pencil } from 'lucide-angular';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [NgIf, RouterLink, LucideAngularModule],
  templateUrl: './edit.component.html'
})
export class EditActionComponent {
  @Input() to?: any[] | string;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() title?: string;
  @Output() clickEdit = new EventEmitter<void>();

  Pencil = Pencil;

  onClick() {
    if (!this.disabled) this.clickEdit.emit();
  }
}
