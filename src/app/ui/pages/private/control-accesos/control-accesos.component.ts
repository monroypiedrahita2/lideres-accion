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
import { lastValueFrom } from 'rxjs';


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
  loading: boolean = false;
  usuario: any
  rol: BaseModel<any> | undefined
  disabled: boolean = false
  permisos!: any
  desabledSwitchs = false

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
    if (this.usuarioData) {
      const iglesia = JSON.parse(this.usuarioData).iglesia;
      this.getPerfilByIglesia(iglesia);
    }
  }

  getPerfilByIglesia(iglesia: string) {
    this.perfilService.getPerfilesByIglesia(iglesia).subscribe({
      next: (response: any[]) => {
        if (response.length > 0) {
          this.usersSelectOptions = response.map((item: any) => {
            return { label: item.nombres + ' ' + item.apellidos, value: item.id }
          })
        }
      }
    })

  }

  async asignarRol() {
    try {
      console.log('asignar rol', this.form.value)
      await this.rolesService.createRole({rol: this.form.value.rol}, this.form.value.usuario)
      this.troastService.success('Rol asignado correctamente', 'Éxito')
    } catch (error) {
      console.log(error)
      this.troastService.error(error as string, 'Error')
    }
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
