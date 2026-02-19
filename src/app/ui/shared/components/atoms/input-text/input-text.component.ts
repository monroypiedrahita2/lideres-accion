import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'mg-input-text [formControlName], mg-input-text [formControl], mg-input-text [ngModel], mg-input-text [(ngModel)]',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  providers: [],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent implements ControlValueAccessor, ErrorStateMatcher {

  @Input() id: string = 'id';
  @Input() textError: string = '';
  @Input() label: string = 'label';
  @Input() autocomplete: string = 'off';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() minlength: number | null = null;
  @Input() maxlength: number | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() disabled: boolean = false;
  @Input() required = false;
  private readonly errorMessages = new Map<string, () => string>();
  public rifInput: any;
  public onChangeFn!: (value: any) => void;
  public onTouchedFn!: () => void;
  matcher = this;

  constructor(@Self() private readonly control: NgControl) {
    this.control.valueAccessor = this;
    this.errorMessages.set('email', () => `${this.label} incorrecto.`);
    this.errorMessages.set('required', () => `El dato es obligatorio.`);
    this.errorMessages.set('minlength', () => `El número de carácteres debe ser mayor a ${this.minlength}.`);
    this.errorMessages.set('maxlength', () => `El número de carácteres debe ser menor a${this.maxlength}.`);
    this.errorMessages.set('min', () => `El valor debe ser mayor a ${this.min}.`);
    this.errorMessages.set('max', () => `El valor debe ser menor a ${this.max}.`);
  }

  public get invalid(): boolean {
    return this.control?.invalid ?? false;
  }

  public get showError(): boolean {
    if (!this.control) {
      return false;
    }
    const { dirty, touched } = this.control;
    return this.invalid ? ((dirty ?? false) || (touched ?? false)) : false;
  }

  public get isSuccess(): boolean {
    if (!this.control) {
      return false;
    }
    const { dirty, touched } = this.control;
    return !this.invalid && ((dirty ?? false) || (touched ?? false));
  }

  public get errors(): Array<string> {
    if (!this.control) {
      return [];
    }

    const { errors } = this.control;
    return Object.keys(errors ?? {}).map(key => this.errorMessages.has(key) ? this.errorMessages.get(key)!() : errors?.[key] || key);
  }

  public registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public writeValue(obj: any): void {
    this.rifInput = obj;
  }

  public onChange() {
    this.onChangeFn(this.rifInput);
  }

  isErrorState(): boolean {
    return this.showError;
  }

}
