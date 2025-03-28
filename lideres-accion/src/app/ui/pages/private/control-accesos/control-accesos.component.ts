import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { PermisosComponent } from '../../../forms/permisos/permisos.component';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { RolesService } from '../../../shared/services/roles/roles.service';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { LIST_ROLES } from '../../../shared/const/Permisos/list-roles.const';
import { PermisosModel, RolesModel } from '../../../../models/roles/roles.model';
import { disableDebugTools } from '@angular/platform-browser';

@Component({
  selector: 'app-control-accesos',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    InputTextComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    PermisosComponent,
    ButtonComponent
  ],
  templateUrl: './control-accesos.component.html',
})
export class ControlAccesosComponent {
  form!: FormGroup;
  rolesSelectOptions: SelectOptionModel<string>[] = LIST_ROLES;
  loading: boolean = false;
  usuario: UsuarioModel | undefined
  rol: BaseModel<RolesModel> | undefined
  disabled: boolean = false
  permisos!: PermisosModel
  desabledSwitchs = false

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private troastService: ToastrService,
    private rolesService: RolesService
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],
    });
  }



    getRoles(name: string) {
      this.rolesService.getRoleByName(name).subscribe({
        next: (response: BaseModel<RolesModel>[]) => {
          this.permisos = response[0].data.permisos;
          this.rol = response[0]
          this.loandingOff()
        },
        error: (error) => {
          console.error(error)
          this.loading = false;
          this.troastService.error('Error al buscar el rol');
        }
      })

  }

  getPerfil(value: string) {
    this.perfilService.getPerfilByEmailoCC(value).subscribe({
      next: (response: UsuarioModel[]) => {
        if (response.length > 0) {
          this.usuario = response[0];
          this.desabledSwitchs = true
          this.loandingOff()
        } else {
          this.troastService.error('Usuario no encontrado');
        }
      },
      error: (error) => {
        this.loading = false;
        this.troastService.error('Error al buscar el usuario');
      },
      complete: () => {
        this.loandingOff()
        this.troastService.success('Perfil encontrado');
      }

    })
  }

  search(data: {usuario: string, rol: string}) {
    if(this.form.invalid) {
      this.troastService.error('Todos los campos son obligatorios');
      return;
    }
    this.loading = true;
    this.getPerfil(data.usuario)
    this.getRoles(data.rol)
    return;
  }

  loandingOff() {
    if(this.usuario && this.rol) {
      this.loading = false
      this.disabled = true
    }
    console.log('this.rol', this.rol)
    console.log('this.permisos', this.permisos)
  }

  clear() {
    this.form.reset();
    this.usuario = undefined;
    this.rol = undefined
    this.disabled = false
  }
}
