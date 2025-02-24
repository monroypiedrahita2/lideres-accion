import { Component, OnInit } from '@angular/core';
import { LugarModel } from '../../../../models/lugar/lugar.model';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { BaseModel } from '../../../../models/base/base.model';
import { ComunaModel } from '../../../../models/referidos/referido.model';
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
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ResponsableModel } from '../../../../models/comuna/comuna.model';

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
    ButtonComponent,
    ContainerGridComponent,
  ],
  providers: [LugaresService],
  templateUrl: './comuna.component.html',
})
export class ComunaComponent implements OnInit {
  form!: FormGroup;
  formBarrios!: FormGroup;
  comuna!: BaseModel<ComunaModel>;
  departamentos: SelectOptionModel<LugarModel>[] = [];
  municipios: SelectOptionModel<LugarModel>[] = [];
  usuarios: SelectOptionModel<ResponsableModel>[] = [];
  barrios: string[] = [];
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private lugarService: LugaresService,
    private toast: ToastrService,
    private location: Location,
    private auth: AuthService,
    private comunaService: ComunaService
  ) {
    this.form = this.fb.group({
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      nombre: ['', Validators.required],
      responsable: ['', Validators.required],
      barrios: ['', Validators.required],
    });

    this.formBarrios = this.fb.group({
      barrio: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.getDepartamentos();
    this.form
      .get('departamento')
      ?.valueChanges.subscribe(async (departamento) => {
        if (departamento) {
          await this.getMunicipios(departamento.id.toString());
        } else {
          this.municipios = [];
          this.form.patchValue({ municipio: '' });
        }
      });
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
        value: {
          nombre: item.name,
          id: item.id,
        },
      }));
    } catch (error) {
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      this.comuna = {
        data: this.form.value as ComunaModel,
        fechaCreacion: new Date().toISOString(),
        creadoPor: {
          uid: this.auth.uidUser(),
          email: this.auth.getEmail(),
        },
      };

      this.comunaService.createComuna(this.comuna);
      this.toast.success('comuna creada correctamente');
      this.loading = false;
      this.location.back();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear la comuna. Intente nuevamente.');
      this.loading = false;
    }
  }

  addBarrio(barrio: string) {
    const delimiters = [',', ';'];
    let barrios = [barrio];

    delimiters.forEach(delimiter => {
      barrios = barrios.flatMap(b => b.split(delimiter));
    });

    barrios = barrios.map(b => b.trim()).filter(b => b);

    this.barrios.push(...barrios);
    this.formBarrios.reset();
  }

  deleteBarrio(i: any) {
    if (i > -1 && i < this.barrios.length) {
      this.barrios.splice(i, 1);
    }
  }
}
