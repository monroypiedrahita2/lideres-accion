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
import {
  SelectOptionModel,
} from '../../../../models/base/select-options.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { BaseModel } from '../../../../models/base/base.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SpinnerComponent } from '../../../shared/components/modules/spinner/spinner.component';
import { ContainerSearchComponent } from '../../../shared/components/modules/container-search/container-search.component';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';

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
    SpinnerComponent,
    ContainerSearchComponent,
    SubTitleComponent
  ],
  providers: [LugaresService, IglesiaService],
  templateUrl: './crear-iglesia.component.html',
})
export class CrearIglesiaComponent implements OnInit {
  form!: FormGroup;
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  iglesia!: BaseModel<IglesiaModel>;
  loading: boolean = false;
  spinner: boolean = true;
  iglesias: BaseModel<IglesiaModel>[] = [];
  data: BaseModel<IglesiaModel>[] = [];
  horarios: SelectOptionModel<string>[] = [
    { value: 'Externo', label: 'Externo' },
    { value: '7:00 AM', label: '7:00 AM' },
    { value: '5:00 PM', label: '5:00 PM' },
    { value: '6:30 PM', label: '6:30 PM' },
    { value: '7:00 PM', label: '7:00 PM' },
  ];

  constructor(
    private fb: FormBuilder,
    private lugarService: LugaresService,
    private toast: ToastrService,
    private location: Location,
    private auth: AuthService,
    private iglesiaService: IglesiaService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[^-]*$/)]],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      horario: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.getDepartamentos();
    this.getIglesias();
    this.form.get('municipio')?.disable();
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
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      this.iglesia = {
        data: {
          nombre: this.form.value.nombre + ' - ' + this.form.value.horario,
          departamento: this.form.value.departamento,
          municipio: this.form.value.municipio,
        },
        fechaCreacion: new Date().toISOString(),
        creadoPor: this.auth.uidUser(),
      };
      await this.iglesiaService.createIglesia(this.iglesia);
      this.toast.success('Iglesia creada correctamente');
      this.loading = false;
      // this.location.back();
      this.form.patchValue({
        nombre: '',
        horario: '',
      })
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear la iglesia. Intente nuevamente.');
      this.loading = false;
    }
  }

  async getIglesias() {
    console.log('this.iglesias');
    this.iglesiaService.getIglesias().subscribe({
      next: (iglesias) => {
        this.iglesias = iglesias;
        this.spinner = false;
        this.data = [...this.iglesias]
      },
      error: (error) => {
        console.error(error);
        this.toast.error('Error al cargar las iglesias');
        this.spinner = false;
      },
    });
  }

    onSearch(data: BaseModel<IglesiaModel>[]) {
      this.data = data
    }

}
