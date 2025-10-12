// input.component.ts
import { ChangeDetectionStrategy, Component, Input, TemplateRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

type InputType = 'text' | 'number' | 'email' | 'password' | 'textarea';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault, NgSwitchDefault],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.component.html',
})
export class InputComponent implements OnInit, OnChanges {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  @Input() label?: string;
  @Input() required = false;
  @Input() hint?: string;

  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() inputId?: string;
  @Input() soft = true;
  @Input() disabled = false;     // <- seguimos recibiéndolo
  @Input() readonly = false;
  @Input() autocomplete?: string;

  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;

  @Input() errors?: Record<string, string>;
  @Input() showErrorsOn: 'touched' | 'dirty' | 'always' = 'touched';

  @Input() prefixTpl?: TemplateRef<unknown>;
  @Input() suffixTpl?: TemplateRef<unknown>;

  get id()       { return this.inputId ?? `${this.controlName}-input`; }
  get helpId()   { return this.hint ? `${this.id}-help` : null; }
  get errId()    { return `${this.id}-error`; }
  get ctrl()     { return this.formGroup?.get(this.controlName); }

  get invalid(): boolean {
    const c = this.ctrl;
    if (!c) return false;
    if (this.showErrorsOn === 'always') return !!c.errors;
    if (this.showErrorsOn === 'dirty')  return !!c.errors && c.dirty;
    return !!c.errors && (c.touched || c.dirty);
  }

  ngOnInit() { this.syncDisabled(); }
  ngOnChanges(ch: SimpleChanges) {
    if ('disabled' in ch) this.syncDisabled();
  }

  private syncDisabled() {
    const c = this.ctrl;
    if (!c) return;
    if (this.disabled && c.enabled) { c.disable({ emitEvent: false }); }
    if (!this.disabled && c.disabled) { c.enable({ emitEvent: false }); }
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

  joinIds(...ids: Array<string | null | undefined>) {
    const out = ids.filter((v): v is string => !!v).join(' ');
    return out || null;
  }
}
