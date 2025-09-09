import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { SkeletonComponent } from '../../../../shared/components/organism/skeleton/skeleton.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputSelectComponent } from '../../../../shared/components/atoms/input-select/input-select.component';
import { SubTitleComponent } from '../../../../shared/components/atoms/sub-title/sub-title.component';
import { SelectOptionModel } from '../../../../../models/base/select-options.model';
import { ReferidoModel } from '../../../../../models/referido/referido.model';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';

@Component({
  selector: 'app-create-referido',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonComponent,
    ReactiveFormsModule,
    InputSelectComponent,
    InputTextComponent,
    SubTitleComponent,
    ButtonComponent,
  ],
  templateUrl: './create-referido.component.html',
})
export class CreateReferidoComponent implements OnInit {
  iglesia: string = JSON.parse(localStorage.getItem('usuario')|| '{}').iglesia;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;
  title: string = this.accion + ' ' + 'referido';
  form!: FormGroup;
  spinner: boolean = true;
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  referidos: SelectOptionModel<any>[] = [];
  esEmprendedor: SelectOptionModel<string>[] = [
    { label: 'Si', value: 'Si' },
    { label: 'No', value: 'No' },
  ];
  barrios: SelectOptionModel<any>[] = [];
  isInternoSelect: SelectOptionModel<string>[] = [
    { label: 'Si', value: 'Interno' },
    { label: 'No', value: 'Externo' },
  ];

  constructor(
    private readonly location: Location,
    private readonly toast: ToastrService,
    private readonly referidoService: ReferidoService,
    private readonly comunasService: ComunaService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      referidoPor: [''],
      isInterno: [false, Validators.required],
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
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
      esEmprendedor: [false],
      comuna: [''],
      barrio: [''],
      direccion: [''],
      camara: [true],
      senado: [true],
      iglesia: [''],
      lugarVotacion: [''],
      mesaVotacion: [''],
    });
  }

  ngOnInit(): void {
    this.enableSkeleton = true;
    this.getReferidos();
    console.log(this.iglesia);
    this.getComunas();
    try {
      this.accion = 'Crear';
      this.enableSkeleton = false;
      this.emailEnabled = false;
    } catch (error) {
      console.error(error);
      this.enableSkeleton = false;
    }
  }

  async goToPage(page: string) {
    await this.copyDocument(page);
  }

  async copyDocument(page: string) {
    const documento = this.form.get('documento')?.value;
    if (documento.length <= 0) {
      this.toast.warning('Flata diligenciar el número de documento');
      return;
    }
    this.toast.info('Número de documento copiado al portapapeles');
    try {
      await navigator.clipboard.writeText(documento);
      window.open(page, '_blank');
    } catch {
      this.toast.error('Error al copiar el número de documento');
    }
  }

  back() {
    this.location.back();
  }

  getComunas() {
    this.comunasService.getComunas().subscribe({
      next: (res: BaseModel<ComunaModel>[]) => {
        this.barrios = res.flatMap((comuna: BaseModel<ComunaModel>) =>
          comuna.data.barrios.map((barrio: string) => ({
            label: comuna.data.nombre + ' - ' + barrio,
            value: barrio,
          }))
        );
      },
    });
  }

  getReferidos() {
    this.referidoService.getReferidoByIglesia(this.iglesia).subscribe({
      next: (res) => {
        this.referidos = res.map((referido: BaseModel<ReferidoModel>) => ({
          label: referido.data.nombres + ' ' + referido.data.apellidos + ' - ' + referido.id,
          value: referido.id,
        }));
        this.enableSkeleton = false;
        console.log(this.referidos);
      },
      error: (err) => {
        console.error('Error getting lideres', err);
      },
      complete: () => {},
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.warning('Falta diligenciar campos obligatorios');
      return;
    }
    await this.saveReferido();
  }

  async saveReferido() {
    const referido: BaseModel<ReferidoModel> = {
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
      data: {...this.form.value, iglesia: this.iglesia},
    };
    try {
      const { documento, ...referidoSinDocumento } = referido as any;
      await this.referidoService.crearReferidoConIdDocumento(
        referidoSinDocumento,
        this.form.get('documento')?.value
      );
      this.location.back();
      this.toast.success('Referido creado correctamente');
    } catch (error) {
      this.toast.error('El referido ya existe o inténtelo más tarde');
      console.error(error);
    }
  }
}
