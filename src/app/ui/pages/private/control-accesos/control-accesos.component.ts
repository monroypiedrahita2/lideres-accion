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
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { LIST_ROLES } from '../../../shared/const/Permisos/list-roles.const';
import { RolesModel } from '../../../../models/roles/roles.model';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';

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
    ButtonComponent,
    MatIconModule
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
  rol: any = '';
  perfilSeleted: PerfilModel | undefined = undefined;
  disabled: boolean = false;
  permisos!: any;
  desabledSwitchs = false;
  roles: RolesModel[] = [];

  constructor(
    private readonly location: Location,
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly toast: ToastrService
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getPerfiles();
    this.form.get('rol')?.disable();
  }

    getPerfil() {
    this.perfilService.getPerfilByDocumento(this.form.value.usuario).subscribe({
      next: (response: any) => {
        console.log(response);

        this.perfilSeleted = response[0];
        this.form.get('rol')?.enable();
        this.toast.info(`Perfil de ${this.perfilSeleted?.nombres} seleccionado`);
        if (response.length > 1) {
          this.toast.warning('El usuario tiene más de un perfil, debe eliminar uno de ellos');
          setTimeout(() => {
            this.toast.success('Correo seleccionado:  ' + this.perfilSeleted?.email);
            this.toast.success('Eliminar el perfil:  ' + response[1]?.email);
          }, 1500);
        }
      },
      error: () => {
        this.toast.error('El usuario no existe', 'Error');
        this.form.get('rol')?.disable();
      },
    });
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
      iglesia: this.iglesia,
    };
    try {
      const uidPerfil = this.perfilSeleted?.id;
        await this.perfilService.updatePerfil(uidPerfil!, rol);
      this.toast.success('Rol asignado correctamente', 'Éxito');
    } catch (error) {
      this.toast.error('Error al asignar el rol', 'Error');
      console.error(error);
    }
  }

  async deleteRol(uid: string) {
    try {
      await this.perfilService.updatePerfil(uid, { rol: '', iglesia: '' });
      this.toast.success('Eliminado el rol correctamente', 'Éxito');
    } catch {
      this.toast.error('Error al asignar el rol', 'Error');
    }
  }

  clear() {
    this.form.reset();
    this.usuario = undefined;
    this.rol = undefined;
    this.disabled = false;
    this.perfilSeleted = undefined;
  }
}
