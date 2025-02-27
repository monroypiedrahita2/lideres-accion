import { Component } from '@angular/core';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { SelectOptionModel } from '../../../../models/base/select-options.model';

@Component({
  selector: 'app-create-referido',
  standalone: true,
  imports: [
    TitleComponent,
    SubTitleComponent,
    InputTextComponent,
    InputSelectComponent,
    CommonModule,
    ReactiveFormsModule,
    ContainerGridComponent
  ],
  templateUrl: './create-referido.component.html',
})
export class CreateReferidoComponent {
  form!: FormGroup;
  title: 'Crear referido' | 'Editar referido' = 'Crear referido'
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];
  barrios: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];
  candidaturas: SelectOptionModel<string | undefined>[] = [];

  constructor (private location: Location, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion: ['', Validators.required],
      iglesia: ['', Validators.required],
      candidaturas: ['', Validators.required]
    })
  }

}
