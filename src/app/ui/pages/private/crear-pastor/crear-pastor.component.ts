import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

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
  iglesia: IglesiaModel = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  rolesSelectOptions: SelectOptionModel<string>[] = LIST_ROLES;
  usersSelectOptions: SelectOptionModel<string>[] = [];
  perfiles: SelectOptionModel<string>[] = [];
  usuarios: PerfilModel[] = [];
  paginatedUsuarios: PerfilModel[] = [];
  iglesias: SelectOptionModel<IglesiaModel>[] = [];
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
  destroyRef = inject(DestroyRef);

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
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (value) {
            return this.perfilService.getPerfilByNoCuenta(value);
          } else {
            this.perfilSeleted = undefined;
            this.form.patchValue({ pastor: '' });
            return of([]);
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: any[]) => {
          if (response && response.length > 0) {
            this.perfilSeleted = response[0];
            this.form.patchValue({ pastor: this.perfilSeleted?.id });
          } else {
            // Only show 'not found' if we actually searched for something (filtered by switchMap logic roughly, relying on response)
            // But if we returned of([]) from empty search, response is [], so we need to valid if search term was present?
            // Actually, if we clear the search, we get [], causing 'No se encontró' to NOT appear because we handle the 'else' in subscribe?
            // The original code: searchByNoCuenta was only called if value exist.
            // If response is empty array...
            if (this.noCuentaSearch.value) { // Check if we searched
              this.perfilSeleted = undefined;
              this.form.patchValue({ pastor: '' });
              this.toast.info('No se encontró usuario con ese No. de Cuenta', 'Información');
            }
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al buscar usuario', 'Error');
        }
      });
  }

  getIglesias() {
    this.iglesiasService.getIglesias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const iglesias = response.map((item: BaseModel<IglesiaModel>) => {
            return { label: item.data.nombre, value: { id: item.id, nombre: item.data.nombre, municipio: item.data.municipio } };
          });

          this.iglesias = iglesias;
        },
      });
  }

  getAllPerfiles() {
    this.perfilService.getPerfiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.loading = true;
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
    } finally {
      this.loading = false;
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

