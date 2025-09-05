import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputSelectComponent } from '../../atoms/input-select/input-select.component';
import { SelectOptionModel } from '../../../../../models/base/select-options.model';
import { LugaresService } from '../../../services/lugares/lugares.service';
import { distinctUntilChanged } from 'rxjs';
import { BaseModel } from '../../../../../models/base/base.model';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-container-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
    ButtonComponent
  ],
  providers: [LugaresService],
  templateUrl: './container-search.component.html',
})
export class ContainerSearchComponent implements OnInit {
  form!: FormGroup;
  filter: SelectOptionModel<string>[] = [
    { label: 'Todo', value: 'todo' },
    { label: 'Por departamento', value: 'departamento' },
    { label: 'Por municipio', value: 'municipio' },
    { label: 'Por iglesia', value: 'iglesia' },
    { label: 'Por comuna', value: 'comuna' },
    { label: 'Por barrio', value: 'barrio' },
  ];

  @Input() atribute: SelectOptionModel<string>[] = [];
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  spinner: boolean = false;
  @Input() data: any;

  @Output() onSubmitSearch: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      filter: ['', Validators.required],
      atribute: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.form
      .get('filter')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.atribute = [];
          this.form.get('atribute')?.setValue('');
          return;
        }
        if (value == 'todo') {
          this.form.get('atribute')?.clearValidators();
          this.form.get('atribute')?.updateValueAndValidity();
          return;
        }
        this.getSelectOfData(value);
      });
  }

  clear() {
    this.form.patchValue({ filter: '', atribute: '' });
    this.onSubmitSearch.emit([]);
  }

  getSelectOfData(atribute: string) {
    console.log('form', this.form.value.filter);
    this.atribute = this.data.map((item: any) => ({
      label: item.data[atribute],
      value: item.data[atribute],
    }));
    this.atribute = this.atribute.filter(
      (option, index, self) =>
        index === self.findIndex((t) => t.value === option.value)
    );
  }

  onSubmit() {
    if (this.form.value.filter == 'todo') {
      this.onSubmitSearch.emit(this.data);
      return;
    }
    const result = this.data.filter((item: BaseModel<any>) => (
      item.data[this.form.value.filter as keyof any] == this.form.value.atribute
    ));
    console.log('result', result);
    this.onSubmitSearch.emit(result);
  }
}
