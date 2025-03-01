import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { distinctUntilChanged, lastValueFrom } from 'rxjs';
import { LugaresService } from '../../../shared/services/lugares/lugares.service';
import { ComunaModel } from '../../../../models/comuna/comuna.model';
import { ComunaService } from '../../../shared/services/comuna/comuna.service';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';

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
    ContainerGridComponent
  ],
  providers: [LugaresService, IglesiaService],
})
export class UsuarioComponent implements OnInit, OnChanges {
  form!: FormGroup;
  user: UsuarioModel | undefined;
  principalText: 'Crear' | 'Editar' = 'Crear';
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];
  barrios: SelectOptionModel<string>[] = [];

  @Input() loading: boolean = false;
  @Input() data!: UsuarioModel;
  @Input() accion!: 'Crear' | 'Editar';
  @Input() title: string = 'MI PERFIL';
  @Input() emailEnabled: boolean = true;
  @Input() autoCompliteEmail: boolean = false;
  @Output() onUserEvent: EventEmitter<UsuarioModel> = new EventEmitter();

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
      email: [''],
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
      this.accion = 'Editar';
      await this.getMunicipios(this.user.departamento.split('-')[0]);
      this.getComunas(this.user.municipio);
      this.getIglesiaByDepartamento(this.user.departamento);
    } else {
      this.accion = 'Crear';
      if (!this.emailEnabled) {
        this.form.patchValue({
          email: this.auth.getEmail()
        })
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
          this.municipios = []
          this.iglesias = [];
          this.comunas = [];

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
    this.form
      .get('comuna')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value == '') {
          this.form.get('barrio')?.setValue('');
          this.barrios = []
        }
      });
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
    } catch (error) {
      console.error(error);
      this.toast.error('Error al cargar los departamentos');
      this.location.back();
    }
  }

  private async loadUserProfile() {
    try {
      this.user = this.data
      this.user ? this.accion = 'Crear' : this.accion = 'Editar'
    } catch (error) {
      console.error(error);
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

  getIglesiaByDepartamento(departamento_id: string) {
    this.iglesiasService.getIglesiaByDepartamento(departamento_id).subscribe({
      next: (iglesias) => {
        this.iglesias = iglesias.map((iglesia: BaseModel<IglesiaModel>) => ({
          label: iglesia.data.nombre,
          value: iglesia.id,
        }));
        if (this.user) {
          this.form.patchValue(this.user);
          this.user = undefined
        }
      },
      error: (error) => {
        console.error(error);
        this.toast.error('Error al cargar las iglesias. Intente nuevamente. ⚠');
      },
    });
  }




  async onSubmit() {
    this.form.get('email')?.enable();
    this.onUserEvent.emit(this.form.value);
    this.form.get('email')?.disable();
  }
}
