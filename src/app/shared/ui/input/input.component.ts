import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';

type InputType = 'text' | 'number' | 'email' | 'password' | 'textarea';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.component.html',
})
export class InputComponent {

  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  // ---- UI/UX
  @Input() label?: string;
  @Input() required = false;
  @Input() hint?: string;

  // tipo y atributos comunes
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() inputId?: string;
  @Input() soft = true;        // si es false, el input ocupa 100% del ancho del contenedor
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() autocomplete?: string;

  // number extras
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;

  @Input() errors?: Record<string, string>;
  @Input() showErrorsOn: 'touched' | 'dirty' | 'always' = 'touched';

  @Input() prefixTpl?: TemplateRef<unknown>;
  @Input() suffixTpl?: TemplateRef<unknown>;

  
  // ids accesibles
  get id(): string {
    return this.inputId ?? `${this.controlName}-input`;
  }
  get helpId(): string | null {
    return this.hint ? `${this.id}-help` : null;
  }
  get errId(): string {
    return `${this.id}-error`;
  }

  get ctrl() {
    return this.formGroup?.get(this.controlName);
  }
  get invalid(): boolean {
    const c = this.ctrl;
    if (!c) return false;
    if (this.showErrorsOn === 'always') return !!c.errors;
    if (this.showErrorsOn === 'dirty')  return !!c.errors && c.dirty;
    // default touched
    return !!c.errors && (c.touched || c.dirty);
  }

  msgForError(): string | null {
    const c = this.ctrl;
    if (!c || !c.errors) return null;
    const map: Record<string, string> = {
      required: 'Campo requerido.',
      email: 'Formato de email inválido.',
      minlength: `Mínimo ${c.getError('minlength')?.requiredLength} caracteres.`,
      maxlength: `Máximo ${c.getError('maxlength')?.requiredLength} caracteres.`,
      pattern: 'Formato inválido.',
      min: `Debe ser ≥ ${c.getError('min')?.min}.`,
      max: `Debe ser ≤ ${c.getError('max')?.max}.`,
      ...this.errors,
    };
    const key = Object.keys(c.errors)[0];
    return map[key] ?? 'Valor inválido.';
  }

  joinIds(...ids: Array<string | null | undefined>): string | null {
  const out = ids.filter((v): v is string => !!v).join(' ');
  return out || null;
}
}
