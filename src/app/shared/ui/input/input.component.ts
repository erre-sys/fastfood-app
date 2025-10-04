import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
})
export class InputComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() type: 'text' | 'number' | 'email' | 'search' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;

  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  @Input() id?: string;
  @Input() inputId?: string;

  get ctrl(): FormControl | null {
    return (this.formGroup?.get(this.controlName) as FormControl) ?? null;
  }
}
