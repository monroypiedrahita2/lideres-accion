import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { LugaresService } from '../../../shared/services/lugares/lugares.service';
import { lastValueFrom } from 'rxjs';
import { LugarModel } from '../../../../models/lugar/lugar.model';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { BaseModel } from '../../../../models/base/base.model';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-iglesias',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    InputTextComponent,
    InputSelectComponent,
    HttpClientModule,
    TitleComponent,
  ],
  providers: [LugaresService, IglesiaService],
  templateUrl: './crear-iglesia.component.html',
})
export class CrearIglesiaComponent implements OnInit {
  form!: FormGroup;
  departamentos: SelectOptionModel<LugarModel>[] = [];
  municipios: SelectOptionModel<LugarModel>[] = [];
  iglesia!: BaseModel<IglesiaModel>;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private lugarService: LugaresService,
    private toast: ToastrService,
    private location: Location,
        private auth: AuthService,
    private iglesiaService: IglesiaService,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
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
      this.location.back()
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      this.iglesia = {
        data: this.form.value as IglesiaModel,
        fechaCreacion: new Date().toISOString(),
        creadoPor: this.auth.uidUser(),
      };

      this.iglesiaService.createIglesia(this.iglesia)
      this.toast.success('Iglesia creada correctamente')
      this.loading = false;
      this.location.back()
    } catch (error) {
      console.error(error)
      this.toast.error('Error al crear la iglesia. Intente nuevamente.');
      this.loading = false;
    }
  }


}
