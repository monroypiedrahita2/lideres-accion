import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { BaseModel } from '../../../../models/base/base.model';
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { ButtonsFormComponent } from '../../../shared/components/modules/buttons-form/buttons-form.component';
import { distinctUntilChanged, lastValueFrom } from 'rxjs';
import { LugaresService } from '../../../shared/services/lugares/lugares.service';
import { ComunaModel } from '../../../../models/comuna/comuna.model';
import { ComunaService } from '../../../shared/services/comuna/comuna.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    RouterModule,
    ReactiveFormsModule,
    InputTextComponent,
    SkeletonComponent,
    InputSelectComponent,
    SubTitleComponent,
    ButtonsFormComponent,
  ],
  providers: [LugaresService, IglesiaService],
})
export class MiPerfilComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  enableSkeleton: boolean = true;
  user!: UsuarioModel | undefined;
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];
  barrios: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];
  accion: 'create' | 'edit' = 'create';

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private location: Location,
    private auth: AuthService,
    private toast: ToastrService,
    private iglesiasService: IglesiaService,
    private lugarService: LugaresService,
    private comunaService: ComunaService
  ) {
    this.form = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', Validators.required],
      celular: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      email: ['', Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      comuna: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion: ['', Validators.required],
      iglesia: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.getDepartamentos();
    await this.loadUserProfile();
    if (this.user) {
      this.accion = 'edit';
      await this.getMunicipios(this.user.departamento.split('-')[0]);
      this.getComunas(this.user.municipio);
      this.getIglesiaByDepartamento(this.user.departamento);
    } else {
      this.accion = 'create';
      this.form.patchValue({
        email: this.auth.getEmail()
      })
      this.form.get('email')?.disable();
    }

    this.form
      .get('departamento')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        console.log(value);

        if (value == '') {
          this.form.get('municipio')?.setValue('');
          this.form.get('comuna')?.setValue('');
          this.form.get('barrio')?.setValue('');
          this.form.get('iglesia')?.setValue('');
        } else {
          this.getMunicipios(value.split('-')[0]);
          this.getIglesiaByDepartamento(value);
        }
      });

    this.form
      .get('municipio')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.form.get('comuna')?.setValue('');
          this.form.get('barrio')?.setValue('');
          this.form.get('iglesia')?.setValue('');
        } else {
          this.getComunas(value);
        }
      });
  }

  async initComponent() {
    await this.loadUserProfile();

    this.form.patchValue({
      email: this.auth.getEmail(),
    });
    this.form.get('email')?.disable();
  }

  async getDepartamentos() {
    try {
      const response = await lastValueFrom(
        this.lugarService.getDepartamentos()
      );
      this.departamentos = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch (error) {
      console.error(error);
      this.toast.error('Error al cargar los departamentos');
      this.location.back();
    }
  }

  getIglesiaByDepartamento(departamento_id: string) {
    this.iglesiasService.getIglesiaByDepartamento(departamento_id).subscribe({
      next: (iglesias) => {
        this.iglesias = iglesias.map((iglesia: BaseModel<IglesiaModel>) => ({
          label: iglesia.data.nombre,
          value: iglesia.id,
        }));
        if (this.user) {
          this.form.patchValue(this.user);
          this.form.get('email')?.disable();
        }
        this.user = undefined;
      },
      error: (error) => {
        console.error(error);
        this.toast.error('Error al cargar las iglesias. Intente nuevamente. ⚠');
      },
    });
  }

  async getMunicipios(departamento_id: string) {
    try {
      const response = await lastValueFrom(
        this.lugarService.getMunicipios(departamento_id)
      );
      this.municipios = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch (error) {
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  private async loadUserProfile() {
    try {
      this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
      this.enableSkeleton = false;
    } catch (error) {
      console.error(error);
      this.enableSkeleton = false;
    }
  }

  async onSubmit() {
    this.loading = true;
    if (this.accion == 'edit') {
      await this.updateUser();
      return;
    }

    try {
      await this.perfilService.crearPerfilConUId(
        this.form.value,
        this.auth.uidUser()
      );
      this.toast.success('Perfil creado ');
      this.location.back();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear el perfil. Intente nuevamente.');
    } finally {
      this.loading = false;
    }
  }

  getComunas(municipio_id: string) {
    this.comunaService.getComunaByMunicipio(municipio_id).subscribe({
      next: (comunas) => {
        this.comunas = comunas.map((comuna: BaseModel<ComunaModel>) => ({
          label: comuna.data.nombre,
          value: comuna.id,
        }));
        this.barrios = comunas.flatMap((comuna: BaseModel<ComunaModel>) =>
          comuna?.data.barrios.map((barrio: string) => ({
            label: barrio,
            value: barrio,
          }))
        );
      },
      error: (error) => {
        console.error(error);
        this.toast.error(
          'Error al cargar las comunas. Intente nuevamente. ���'
        );
      },
    });
  }

  async updateUser() {
    try {
      await this.perfilService.updateDoc(this.auth.uidUser(), this.form.value);
      this.toast.success('Usuario actualizado');
      this.location.back();
    } catch {
      this.toast.error('Error al actualizar el usuario. Intente nuevamente.');
      this.loading = false;
    }
  }
}
