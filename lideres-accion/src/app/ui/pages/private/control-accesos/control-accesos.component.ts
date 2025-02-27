import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';

@Component({
  selector: 'app-control-accesos',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    TitleComponent,
    SubTitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent

  ],
  templateUrl: './control-accesos.component.html',
})
export class ControlAccesosComponent {
  form!: FormGroup
  formPermisos!: FormGroup
  usuarios: SelectOptionModel<string>[] = []
  roles: SelectOptionModel<string>[] = [];


  constructor(private location: Location, private fb: FormBuilder) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],

    })
    // Usuarios
    this.formPermisos = this.fb.group({
      UsuariosTodos: [true],
      UsuariosDepartamento: [true],
      UsuariosMunicipio: [true],
      UsuariosIglesia: [true],
      UsuariosComuna: [true],

      // Refridos
      ReferidosTodos: [true],
      ReferidosDepartamento: [true],
      ReferidosMunicipio: [true],
      ReferidosIglesia: [true],
      ReferidosComuna: [true],



      // Permisos
      PermisosTodos: [true],
      PermisosDepartamento: [true],
      PermisosMunicipio: [true],
      PermisosIglesia: [true],
      PermisosComuna: [true],

      //Iglesias
      IglesiasTodas: [true],
      IglesiasDepartamento: [true],
      IglesiasMunicipio: [true],
      IglesiasComuna: [true],

      //Comunas
      ComunasTodas: [true],
      ComunasDepartamento: [true],
      ComunasMunicipio: [true],
    })


   }


   onSubmit(){
    console.log(this.form.value)
    console.log(this.formPermisos.value)
   }

}
