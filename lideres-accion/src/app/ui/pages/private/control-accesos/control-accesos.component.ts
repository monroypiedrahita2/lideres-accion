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

    })
    // Usuarios
    this.formPermisos = this.fb.group({
      UsuariosTodos: [false],
      UsuariosDepartamento: [false],
      UsuariosMunicipio: [false],
      UsuariosIglesia: [false],
      UsuariosComuna: [false],

      // Refridos
      ReferidosTodos: [false],
      ReferidosDepartamento: [false],
      ReferidosMunicipio: [false],
      ReferidosIglesia: [false],
      ReferidosComuna: [false],



      // Permisos
      PermisosTodos: [false],
      PermisosDepartamento: [false],
      PermisosMunicipio: [false],
      PermisosIglesia: [false],
      PermisosComuna: [false],

      //Iglesias
      IglesiasTodos: [false],
      IglesiasDepartamento: [false],
      IglesiasMunicipio: [false],
      IglesiasIglesia: [false],
      IglesiasComuna: [false],

      //Comunas
      ComunasTodos: [false],
      ComunasDepartamento: [false],
      ComunasMunicipio: [false],
      ComunasIglesia: [false],
      ComunasComuna: [false],
    })


   }


   onSubmit(){
    console.log(this.form.value)
    console.log(this.formPermisos.value)
   }

}
