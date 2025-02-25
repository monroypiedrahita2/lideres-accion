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
import { LugarModel } from '../../../../models/lugar/lugar.model';
import { lastValueFrom } from 'rxjs';
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
  user!: BaseModel<UsuarioModel>;
  departamentos: SelectOptionModel<LugarModel>[] = [];
  municipios: SelectOptionModel<LugarModel>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];
  barrios: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private location: Location,
    private auth: AuthService,
    private toast: ToastrService,
    private iglesiasService: IglesiaService,
    private lugarService: LugaresService,
    private comunaService: ComunaService,
  ) {
    this.form = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', Validators.required],
      celular: ['', Validators.required],
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

    this.form
    .get('departamento')
    ?.valueChanges.subscribe(async (departamento) => {
      if (departamento) {
        await this.getMunicipios(departamento.id.toString());
        this.getIglesiaByDepartamento(Number(departamento.id));
      } else {
        this.municipios = [];
        this.form.patchValue({ municipio: '' });
      }
    });

    this.form
      .get('municipio')
      ?.valueChanges.subscribe(async (municipio) => {
        if (municipio) {
          this.getComunas(municipio.id.toString());
        } else {
          this.comunas = [];
          this.form.patchValue({ comuna: '' });
        }
      });
    await this.loadUserProfile();
  }




    async getDepartamentos() {
      try {
        const response = await lastValueFrom(
          this.lugarService.getDepartamentos()
        );
        this.departamentos = response.map((item: any) => ({
          label: item.name,
          value: {
            nombre: item.name,
            id: item.id,
          },
        }));
      } catch (error) {
        console.error(error);
        this.toast.error('Error al cargar los departamentos');
        this.location.back();
      }
    }

    getIglesiaByDepartamento(departamento_id: number) {
      this.iglesiasService.getIglesiaByDepartamento(departamento_id).subscribe({
        next: (iglesias) => {
          this.iglesias = iglesias.map((iglesia: BaseModel<IglesiaModel>) => ({
        label: `${iglesia.data.municipio.nombre}-${iglesia.data.nombre}`,
        value: iglesia?.id,
          }));
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
        this.form.patchValue({
          municipio: '',
        });
        this.municipios = response.map((item: any) => ({
          label: item.name,
          value: {
            nombre: item.name,
            id: item.id,
          },
        }));
      } catch (error) {
        this.toast.error('Error al cargar los municipios');
        this.location.back()
      }
    }

  private async loadUserProfile() {
    try {
      const response = await this.perfilService.getMiPerfil(this.auth.uidUser());

      console.log('mi perfil', response)
      if (response) {
        this.form.patchValue(response);
      }
      this.enableSkeleton = false;
    } catch (error) {
      console.error(error);
      this.toast.error('Error al cargar el perfil. Intente nuevamente. ⚠');
      this.navigateBack();
    }
  }

  private navigateBack() {
    this.location.back();
  }

  async onSubmit() {
    this.loading = true;
    try {
      await this.perfilService.crearPerfilConUId(this.form.value, this.auth.uidUser());
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
    this.comunaService.getComunaByDepartamento(Number(municipio_id)).subscribe({
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
        this.toast.error('Error al cargar las comunas. Intente nuevamente. ���');
      },
    })

  }
}
