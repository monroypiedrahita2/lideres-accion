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
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { LIST_ROLES } from '../../../shared/const/Permisos/list-roles.const';
import { RolesModel } from '../../../../models/roles/roles.model';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-control-accesos',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
  ],
  templateUrl: './control-accesos.component.html',
})
export class ControlAccesosComponent implements OnInit {
  form!: FormGroup;
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  rolesSelectOptions: SelectOptionModel<string>[] = LIST_ROLES;
  usersSelectOptions: SelectOptionModel<string>[] = [];
  usuarios: PerfilModel[] = [];
  loading: boolean = false;
  rol: BaseModel<any> | undefined;
  disabled: boolean = false;
  permisos!: any;
  desabledSwitchs = false;
  roles: RolesModel[] = [];

  constructor(
    private readonly location: Location,
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly troastService: ToastrService
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getPerfiles();
  }

  getPerfiles() {
    if (this.usuario.rol === 'Super usuario') {
      this.getAllPerfiles();
    } else {
      this.getPerfilesByIglesia();
    }
  }

  getAllPerfiles() {
    this.perfilService.getPerfiles().subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
        this.usersSelectOptions = response.map((item: any) => {
          return { label: item.nombres + ' ' + item.apellidos, value: item.id };
        });
      },
    });
  }

  getPerfilesByIglesia() {
    this.perfilService.getPerfilesByIglesia(this.iglesia).subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
        this.usersSelectOptions = response.map((item: any) => {
          return { label: item.nombres + ' ' + item.apellidos, value: item.id };
        });
      },
    });
  }

  async asignarRol() {
    const rol = {
      rol: this.form.value.rol,
    };
    try {
      await this.perfilService.updatePerfil(this.form.value.usuario, rol);
      this.troastService.success('Rol asignado correctamente', 'Éxito');
    } catch (error) {
      this.troastService.error('Error al asignar el rol', 'Error');
      console.error(error);
    }
  }

  async deleteRol(uid: string) {
    try {
      await this.perfilService.updatePerfil(uid, { rol: null });
      this.troastService.success('Eliminado el rol correctamente', 'Éxito');
    } catch {
      this.troastService.error('Error al asignar el rol', 'Error');
    }
  }

  clear() {
    this.form.reset();
    this.usuario = undefined;
    this.rol = undefined;
    this.disabled = false;
  }
}
