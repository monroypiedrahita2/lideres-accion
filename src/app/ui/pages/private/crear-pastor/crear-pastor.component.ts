import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { LIST_ROLES } from '../../../shared/const/Permisos/list-roles.const';
import { RolesModel } from '../../../../models/roles/roles.model';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';

@Component({
  selector: 'app-crear-pastor',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    InputTextComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    MatIconModule,
    MatPaginatorModule,
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
  paginatedUsuarios: PerfilModel[] = [];
  iglesias: SelectOptionModel<any>[] = [];
  loading: boolean = false;
  rol: any = '';
  perfilSeleted: PerfilModel | undefined = undefined;
  disabled: boolean = false;
  permisos!: any;
  desabledSwitchs = false;
  roles: RolesModel[] = [];

  // Pagination
  length = 0;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  noCuentaSearch = new FormControl('');

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
    this.noCuentaSearch.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        if (value) {
          this.searchByNoCuenta(value);
        } else {
          this.perfilSeleted = undefined;
          this.form.patchValue({ pastor: '' });
        }
      });
  }

  searchByNoCuenta(value: string) {
    this.perfilService.getPerfilByNoCuenta(value).subscribe({
      next: (response: any[]) => {
        if (response && response.length > 0) {
          this.perfilSeleted = response[0];
          this.form.patchValue({ pastor: this.perfilSeleted?.id });
        } else {
          this.perfilSeleted = undefined;
          this.form.patchValue({ pastor: '' });
          this.toast.info('No se encontró usuario con ese No. de Cuenta', 'Información');
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error al buscar usuario', 'Error');
      }
    });
  }

  getIglesias() {
    this.iglesiasService.getIglesias().subscribe({
      next: (response) => {
        const iglesias = response.map((item: BaseModel<IglesiaModel>) => {
          return { label: item.data.nombre, value: item.id };
        });

        this.iglesias = iglesias;
      },
    });
  }

  getAllPerfiles() {
    this.perfilService.getPerfiles().subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
        this.length = this.usuarios.length;
        this.updatePaginatedUsers();

        this.perfiles = response.map((item: any) => {
          return { label: `${item.noCuenta} - ${item.nombres} ${item.apellidos}`, value: item.id };
        });
      },
    });
  }

  handlePageEvent(e: any) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsuarios = this.usuarios.slice(startIndex, endIndex);
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
