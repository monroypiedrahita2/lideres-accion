import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from '../../../shared/services/roles/roles.service';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { LIST_ROLES } from '../../../shared/const/Permisos/list-roles.const';
import { RolesModel, UsuarioModel } from '../../../../models/roles/roles.model';


@Component({
  selector: 'app-control-accesos',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    ButtonComponent
  ],
  templateUrl: './control-accesos.component.html',
})
export class ControlAccesosComponent implements OnInit {
  form!: FormGroup;
  usuarioData = localStorage.getItem('usuario');
  rolesSelectOptions: SelectOptionModel<string>[] = LIST_ROLES;
  usersSelectOptions: SelectOptionModel<string>[] = [];
  usuarios: UsuarioModel[] = []
  loading: boolean = false;
  usuario: any
  rol: BaseModel<any> | undefined
  disabled: boolean = false
  permisos!: any
  desabledSwitchs = false
  roles: RolesModel[] = []

  constructor(
    private readonly location: Location,
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly troastService: ToastrService,
    private readonly rolesService: RolesService
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getAllRoles();

  }

  getPerfilByIglesia(iglesia: string) {
    this.perfilService.getPerfilesByIglesia(iglesia).subscribe({
      next: (response: any[]) => {
        if (response.length > 0) {
          this.usuarios = response.map((item: any) => {
            const rol = this.roles.find(r => r.id === item.id)
            return { ...item, rol: rol ? rol.rol : 'Sin rol asignado' }
          })
          this.usersSelectOptions = response.map((item: any) => {
            return { label: item.nombres + ' ' + item.apellidos, value: item.id }
          })
        }
      }
    })

  }

  getAllRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roles = response
      if (this.usuarioData) {
      const iglesia = JSON.parse(this.usuarioData).iglesia;
      this.getPerfilByIglesia(iglesia);
    }
      }

    })
  }

  async asignarRol() {
    try {
      await this.rolesService.createRole({rol: this.form.value.rol}, this.form.value.usuario)
      this.troastService.success('Rol asignado correctamente', 'Éxito')
    } catch {
      this.troastService.error('Error al asignar el rol', 'Error')
    }
  }

  async deleteRol(user: UsuarioModel) {
    this.rolesService.deleteRole(user.id)
    this.troastService.success('Rol eliminado correctamente', 'Éxito')
  }

  clear() {
    this.form.reset();
    this.usuario = undefined;
    this.rol = undefined
    this.disabled = false
  }
}
