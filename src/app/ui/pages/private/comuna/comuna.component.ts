import { Component, OnInit } from '@angular/core';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { BaseModel } from '../../../../models/base/base.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LugaresService } from '../../../shared/services/lugares/lugares.service';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ComunaService } from '../../../shared/services/comuna/comuna.service';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { HttpClientModule } from '@angular/common/http';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { ButtonsFormComponent } from '../../../shared/components/modules/buttons-form/buttons-form.component';
import { ComunaModel } from '../../../../models/comuna/comuna.model';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-comuna',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    InputTextComponent,
    InputSelectComponent,
    HttpClientModule,
    TitleComponent,
    SubTitleComponent,
    ButtonsFormComponent,
    ContainerGridComponent,
    SkeletonComponent,
  ],
  providers: [LugaresService],
  templateUrl: './comuna.component.html',
})
export class ComunaComponent implements OnInit {
  form!: FormGroup;
  formBarrios!: FormGroup;
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<number>[] = [];
  usuarios: SelectOptionModel<string>[] = [];
  barrios: string[] = [];
  loading: boolean = false;
  enableSkeleton: boolean = true;
  iglesiaIdbyUser: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;

  constructor(
    private readonly fb: FormBuilder,
    private readonly lugarService: LugaresService,
    private readonly toast: ToastrService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly comunaService: ComunaService
  ) {
    this.form = this.fb.group({
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[^-]*$/)]],
    });

    this.formBarrios = this.fb.group({
      barrio: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initComponent();
    this.form
      .get('departamento')
      ?.valueChanges.subscribe(async (departamento) => {
        if (departamento) {
          this.form.get('municipio')?.enable();
          await this.getMunicipios(departamento.split('-')[0]);
        } else {
          this.form.get('municipio')?.disable();
          this.municipios = [];
          this.form.patchValue({ municipio: '' });
        }
      });
  }

  async initComponent() {
    await this.getDepartamentos();
    this.form.get('municipio')?.disable();
    this.enableSkeleton = false;
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
      console.error('Error al cargar los departamentos:', error);
      this.toast.error('Error al cargar los departamentos');
      this.location.back();
    }
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
        value: item.id + '-' + item.name,
      }));
    } catch (error) {
      console.error('Error al cargar los municipios:', error);
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      const promises = this.barrios.map(
        (barrio) => {
          this.generateBarrios(this.form.value.nombre + ' - ' + barrio)
          return Promise.resolve();
        }
      )

      Promise.all(promises)
        .then(() => {
          this.toast.success('Barrios guardados exitosamente');
          this.location.back();
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });

      this.toast.success('comuna creada correctamente');
      this.loading = false;
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear la comuna. Intente nuevamente.');
      this.loading = false;
    }
  }

  async generateBarrios(barrio: string) {
    const newBarrio: BaseModel<ComunaModel> = {
      data: {
        departamento: this.form.value.departamento,
        municipio: this.form.value.municipio,
        barrio: barrio.split(' - ')[1],
        iglesiaId: this.iglesiaIdbyUser,
        comuna: barrio.split(' - ')[0],
      },
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
    };
    try {
      await this.comunaService.createComuna(newBarrio);
      this.toast.success(
        `Barrio ${barrio.split(' - ')[1]} creado correctamente.`
      );
    } catch (error) {
      console.error(error);
      this.toast.error(
        `Error al crear el barrio ${barrio.split(' - ')[1]
        }. Intente nuevamente.`
      );
    }
  }

  addBarrio(barrio: string) {
    const delimiters = [',', ';', '-'];
    let barrios = [barrio];

    delimiters.forEach((delimiter) => {
      barrios = barrios.flatMap((b) => b.split(delimiter));
    });

    barrios = barrios.map((b) => b.trim()).filter((b) => b);

    this.barrios.push(...barrios);
    this.formBarrios.reset();
  }

  deleteBarrio(i: any) {
    if (i > -1 && i < this.barrios.length) {
      this.barrios.splice(i, 1);
    }
  }

  generateSelectOptionUsuarios(res: BaseModel<any>[]) {
    this.usuarios = res.map((item: BaseModel<any>) => {
      return {
        label:
          item?.data?.nombres +
          ' ' +
          item?.data?.apellidos +
          ' ' +
          item?.data?.email,
        value: item.id,
      } as SelectOptionModel<string>;
    });
  }
}
