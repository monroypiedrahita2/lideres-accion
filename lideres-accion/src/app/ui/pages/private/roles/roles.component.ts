import { UsuarioModel } from './../../../../models/usuarios/usuario.model';
import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { PermisosComponent } from '../../../forms/permisos/permisos.component';
import { RolesService } from '../../../shared/services/roles/roles.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { PermisosModel, RolesModel } from '../../../../models/roles/roles.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputSelectComponent,
    TitleComponent,
    ContainerGridComponent,
    PermisosComponent
  ],
  templateUrl: './roles.component.html',
})
export class RolesComponent {
  form!: FormGroup;
  niveles: SelectOptionModel<number>[] = [
    { label: '1 - Uno (Más alto)', value: 1 },
    { label: '2 - Dos', value: 2 },
    { label: '3 - Tres', value: 3 },
    { label: '4 - Cuatro', value: 4 },
    { label: '5 - Cinco', value: 5 },
    { label: '6 - Seis', value: 6 },
    { label: '7 - Siete', value: 7 },
    { label: '8 - Ocho', value: 8 },
    { label: '9 - Nueve', value: 9 },
    { label: '10 - Diez (Menos alto)', value: 10 },
    // {label: 'Super usuario', value: 1},
    // { label: 'Coordinador nacional', value: 2 },
    // { label: 'Coordinador departamental', value: 3 },
    // { label: 'Coordinador de municipio', value: 4 },
    // { label: 'Coordinador de iglesia', value: 5 },
    // { label: 'Apoyo de iglesias', value: 6 },
    // { label: 'Coordinador de comuna', value: 7 },
    // { label: 'Líder', value: 8 },
  ]

  constructor(private location: Location, private fb: FormBuilder, private rolesService: RolesService,
     private authService: AuthService,
    private toast: ToastrService) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      nivel: ['', [Validators.required]],
    })

  }




  async onSubmit(data: PermisosModel) {

    const rol: BaseModel<RolesModel> = {
      data: {
        nombre: this.form.value.nombre,
        nivel: this.form.value.nivel,
        permisos: data
      },
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.authService.uidUser(),

    }


    console.log(rol)
    try {
      await this.rolesService.createRole(rol)
      this.toast.success('Rol creado correctamente');

    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear el rol. No tienes permisos.');
    }

  }
}
