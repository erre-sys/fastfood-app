import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
})
export class AppSelectComponent implements OnInit, OnChanges {
  // Forms
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  // UI
  @Input() label?: string;
  @Input() required = false;
  @Input() hint?: string;
  @Input() soft = true;
  @Input() disabled = false; // <- propiedad real

  // Datos
  @Input({ required: true }) items: any[] = [];
  @Input() labelKey = 'label';
  @Input() valueKey = 'value';
  @Input() includeNull = false;
  @Input() nullLabel = '-- Selecciona --';

  // Comparador opcional para objetos (si value es objeto)
  @Input() compareWith?: (o1: any, o2: any) => boolean;

  /** Optimizar para pantallas táctiles */
  @Input() touchOptimized = false;

  // Errores
  @Input() errors?: Record<string, string>;
  @Input() showErrorsOn: 'touched' | 'dirty' | 'always' = 'touched';

  // ids
  @Input() selectId?: string;
  get id(): string { return this.selectId ?? `${this.controlName}-select`; }
  get helpId(): string | null { return this.hint ? `${this.id}-help` : null; }
  get errId(): string { return `${this.id}-error`; }

  get ctrl() { return this.formGroup?.get(this.controlName); }
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
      ...this.errors,
    };
    const key = Object.keys(c.errors)[0];
    return map[key] ?? 'Valor inválido.';
  }

  labelOf(item: any): string {
    return typeof item === 'object' ? String(item?.[this.labelKey] ?? '') : String(item ?? '');
  }
  valueOf(item: any): any {
    return typeof item === 'object' ? item?.[this.valueKey] : item;
  }

  joinIds(...ids: Array<string | null | undefined>): string | null {
    const out = ids.filter((v): v is string => !!v).join(' ');
    return out || null;
  }
}
