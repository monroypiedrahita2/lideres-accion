import { CommonModule, Location } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TitleComponent } from '../../shared/components/atoms/title/title.component';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextComponent } from '../../shared/components/atoms/input-text/input-text.component';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SelectOptionModel } from '../../../models/base/select-options.model';
import { IglesiaModel } from '../../../models/iglesia/iglesia.model';
import { InputSelectComponent } from '../../shared/components/atoms/input-select/input-select.component';
import { BaseModel } from '../../../models/base/base.model';
import { UsuarioModel } from '../../../models/usuarios/usuario.model';
import { IglesiaService } from '../../shared/services/iglesia/iglesia.service';
import { SubTitleComponent } from '../../shared/components/atoms/sub-title/sub-title.component';
import { distinctUntilChanged, lastValueFrom } from 'rxjs';
import { LugaresService } from '../../shared/services/lugares/lugares.service';
import { ComunaModel } from '../../../models/comuna/comuna.model';
import { ComunaService } from '../../shared/services/comuna/comuna.service';
import { ContainerGridComponent } from '../../shared/components/atoms/container-grid/container-grid.component';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../shared/components/atoms/button/button.component';
import { SpinnerComponent } from '../../shared/components/modules/spinner/spinner.component';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './usuario.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    RouterModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputSelectComponent,
    SubTitleComponent,
    ContainerGridComponent,
    MatIconModule,
    ButtonComponent,
    SpinnerComponent,
  ],
  providers: [LugaresService],
})
export class UsuarioComponent implements OnInit, OnChanges {
  form!: FormGroup;
  formVotacion!: FormGroup;
  formOtrosDatos!: FormGroup;
  user: UsuarioModel | undefined;
  principalText: 'Crear' | 'Editar' = 'Crear';
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  municipiosVotacion: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];
  barrios: SelectOptionModel<string>[] = [];
  spinner: boolean = true;

  esEmprendedor: SelectOptionModel<boolean>[] = [
    { label: 'No', value: false },
    { label: 'Sí', value: true },
  ];

  @Input() showLugarVotacion: boolean = false;
  @Input() loading: boolean = false;
  @Input() hiddenOtrosDatos: boolean = false;
  @Input() data!: UsuarioModel;
  @Input() accion!: 'Crear' | 'Editar';
  @Input() title: string = 'MI PERFIL';
  @Input() emailEnabled: boolean = true;
  @Input() autoCompliteEmail: boolean = false;
  @Output() onUserEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
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
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      celular: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      email: [''],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion: ['', Validators.required],
      iglesia: ['', Validators.required],
    });

    this.formVotacion = this.fb.group({
      departamento: [''],
      municipio: [''],
      lugar: [''],
      mesa: [''],
    });

    this.formOtrosDatos = this.fb.group({
      esEmprendedor: [''],
      actividadEconomica: [''],
      fechaNacimiento: [''],
    });
  }

  async ngOnInit() {
    await this.getDepartamentos();
    await this.loadUserProfile();
    if (this.user) {
      this.accion = 'Editar';
      await this.getMunicipios(this.user.departamento.split('-')[0]);
      this.getComunas(this.user.municipio);
      this.getIglesiaByDepartamento(this.user.departamento);
    } else {
      this.accion = 'Crear';
      if (!this.emailEnabled) {
        this.form.patchValue({
          email: this.auth.getEmail(),
        });
        this.form.get('email')?.disable();
      }
    }

    this.form
      .get('departamento')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.form.get('municipio')?.setValue('');
          this.form.get('comuna')?.setValue('');
          this.form.get('barrio')?.setValue('');
          this.form.get('iglesia')?.setValue('');
          this.municipios = [];
          this.iglesias = [];
          this.comunas = [];
        } else {
          this.getMunicipios(value.split('-')[0]);
          this.getIglesiaByDepartamento(value);
        }
      });

    this.formVotacion
      .get('departamento')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.formVotacion.get('municipio')?.setValue('');
          this.municipiosVotacion = [];
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
          this.barrios = [];
        } else {
          this.getComunas(value);
        }
      });
    this.form
      .get('comuna')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.form.get('barrio')?.setValue('');
          this.form.patchValue({
            barrio: '',
          });
        }
      });

    if (this.showLugarVotacion) {
      this.formVotacion
        .get('departamento')
        ?.valueChanges.pipe(distinctUntilChanged())
        .subscribe((value) => {
          if (value == '') {
            this.formVotacion.get('municipio')?.setValue('');
            this.formVotacion.get('lugar')?.setValue('');
            this.formVotacion.get('mesa')?.setValue('');
          } else {
            this.getMunicipios(value.split('-')[0]);
            this.getIglesiaByDepartamento(value);
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emailEnabled']) {
      if (this.emailEnabled) {
        this.form.get('email')?.enable();
      } else {
        this.form.get('email')?.disable();
      }
    }
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
      this.municipiosVotacion = this.municipios;
    } catch (error) {
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  async getMunicipiosVotacion(departamento_id: string) {
    try {
      const response = await lastValueFrom(
        this.lugarService.getMunicipios(departamento_id)
      );
      this.municipiosVotacion = response.map((item: any) => ({
        label: item.name,
        value: item.name,
      }));
    } catch (error) {
      this.toast.error('Error al cargar los municipios');
      this.location.back();
    }
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
      if (!this.user) {
        this.spinner = false;
      }
    } catch (error) {
      console.error(error);
      this.toast.error('Error al cargar los departamentos');
      this.location.back();
    }
  }

  private async loadUserProfile() {
    try {
      this.user = this.data;
      this.user ? (this.accion = 'Crear') : (this.accion = 'Editar');
    } catch (error) {
      console.error(error);
    }
  }

  getComunas(municipio_id: string) {
    this.comunaService.getComunaByMunicipio(municipio_id).subscribe({
      next: (comunas) => {
        this.barrios = comunas.flatMap((comuna: BaseModel<ComunaModel>) =>
          comuna?.data.barrios.map((barrio: string) => ({
            label: barrio + ' - ' + comuna.data.nombre,
            value: comuna.data.nombre + '-' + barrio,
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

  getIglesiaByDepartamento(departamento_id: string) {
    this.iglesiasService.getIglesiaByDepartamento(departamento_id).subscribe({
      next: (iglesias) => {
        const response = iglesias.map((iglesia: BaseModel<IglesiaModel>) => ({
          label: iglesia.data.nombre,
          value:
            iglesia.data.nombre + '-' + iglesia.data.municipio.split('-')[1],
        }));
        this.iglesias = [
          {
            label: 'Externo',
            value: 'Externo',
          },
          ...response,
        ];

        if (this.user) {
          this.form.patchValue(this.user);
          this.formVotacion.patchValue(this.user);
          this.user = undefined;
          this.spinner = false;
        }
      },
      error: (error) => {
        console.error(error);
        this.toast.error('Error al cargar las iglesias. Intente nuevamente. ⚠');
      },
    });
  }

  async goToPage(page: string) {
    await this.copyDocument();
    window.open(page, '_blank');
  }

  async copyDocument() {
    const documento = this.form.get('documento')?.value;
    if (documento == '') {
      this.toast.warning('Flata diligenciar el número de documento');
    }
    try {
      await navigator.clipboard.writeText(documento);
      if (documento == '') {
        this.toast.warning('Diligencia primero los campos');
      } else {
        this.toast.success(documento + ' copiado al portapapeles');
      }
    } catch (err) {
      this.toast.error('Error al copiar el número de documento');
      console.error('Error al copiar el número de documento: ', err);
    }
  }

  async onSubmit() {
    const usuario = {
      nombres: this.form.get('nombres')?.value,
      apellidos: this.form.get('apellidos')?.value,
      documento: this.form.get('documento')?.value,
      departamento: this.form.get('departamento')?.value,
      municipio: this.form.get('municipio')?.value,
      comuna: this.form.get('barrio')?.value.split('-')[0],
      barrio: this.form.get('barrio')?.value.split('-')[1],
      direccion: this.form.get('direccion')?.value,
      celular: this.form.get('celular')?.value,
      email: this.form.get('email')?.value,
      iglesia: this.form.get('iglesia')?.value,
    };
    this.form.get('email')?.enable();
    if (this.showLugarVotacion) {
      this.onUserEvent.emit({
        ...usuario,
        lugarVotacion: this.formVotacion.value,
        ...this.formOtrosDatos.value,
      });
    } else {
      this.onUserEvent.emit(usuario);
    }
    this.form.get('email')?.disable();
  }
}
