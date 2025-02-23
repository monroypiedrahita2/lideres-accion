import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Optional, Output, Self, SimpleChanges, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ControlValueAccessor,
  FormsModule,
  NgControl,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'mg-input-select',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    CommonModule

  ],
  providers: [],
  templateUrl: './input-select.component.html',
})
export class InputSelectComponent implements ControlValueAccessor, ErrorStateMatcher, OnInit, OnChanges {

  @ViewChild('input', { static: false }) input?: ElementRef<HTMLInputElement>;
  @Input() id: string = 'id';
  @Input() label: string = 'label';
  @Input() items: Array<SelectOption> = [];
  @Input() showAlert: boolean = false
  @Input() placeholder: string = ''
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  filteredOptions: Array<SelectOption> = [];
  private errorMessages = new Map<string, () => string>();
  public rifInput: any;
  public onChangeFn!: (value: any) => void;
  public onTouchedFn!: () => void;
  matcher = this;

  constructor(@Self() @Optional() private control: NgControl) {
    this.control.valueAccessor = this;
    this.errorMessages.set('required', () => `La pregunta es obligatoria.`);
  }

  ngOnInit(): void {
    this.filter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['items']) {
      return;
    }
    this.filter();
  }

  compareWith(o1: any, o2: any) {
    console.log(o1, o2);
    return o1?.id && o2?.id ? o1.id == o2.id: o1 == o2;
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

  filter(): void {
    const filterValue = this.input?.nativeElement.value.toLowerCase() ?? '';
    this.filteredOptions = this.items.filter(o => o.label.toLowerCase().includes(filterValue));
  }

  inputLabel = (value: number) => {
    return this.items.find((option) => option.value == value)?.label ?? '';
  }

  clearInput() {
    this.rifInput = '';
    this.filteredOptions = this.items;
    this.onChangeFn(this.rifInput);
    this.onTouchedFn(); 
  }

}
