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
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';

@Component({
  selector: 'app-crear-pastor',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    MatIconModule,
  ],
  templateUrl: './crear-pastor.component.html',
})
export class CrearPastorComponent implements OnInit {
  form!: FormGroup;
  usuario: PerfilModel | undefined = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  rolesSelectOptions: SelectOptionModel<string>[] = LIST_ROLES;
  usersSelectOptions: SelectOptionModel<string>[] = [];
  perfiles: SelectOptionModel<string>[] = [];
  usuarios: PerfilModel[] = [];
  iglesias: SelectOptionModel<any>[] = [];
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
    private readonly toast: ToastrService,
    private readonly iglesiasService: IglesiaService
  ) {
    this.form = this.fb.group({
      pastor: ['', [Validators.required]],
      iglesia: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getIglesias();
    this.getAllPerfiles();
  }

  getIglesias() {
    this.iglesiasService.getIglesias().subscribe({
      next: (response) => {
        const iglesias = response.map((item: BaseModel<IglesiaModel>) => {
          return { label: item.data.nombre.split('-')[0], value: item.id };
        });

        this.iglesias = iglesias;
      },
    });
  }

  getAllPerfiles() {
    this.perfilService.getPerfiles().subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
        this.perfiles = response.map((item: any) => {
          return { label: item.nombres + ' ' + item.apellidos, value: item.id };
        });
      },
    });
  }

  async asignarRol() {
    try {
      const update = {
        rol: 'Pastor',
        iglesia: this.form.value.iglesia,
      };
      if (this.form.value.pastor) {
        await this.perfilService.updatePerfil(this.form.value.pastor, update);
      }
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
