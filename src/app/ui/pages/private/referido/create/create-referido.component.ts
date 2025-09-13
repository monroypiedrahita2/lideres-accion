import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
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
import { ActivatedRoute } from '@angular/router';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

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
  id!: string | null;
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  userRol: string = JSON.parse(localStorage.getItem('usuario') || '{}').rol;
  user: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
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
  isInternoSelect: SelectOptionModel<any>[] = [
    { label: 'Si', value: true },
    { label: 'No', value: false },
  ];

  constructor(
    private readonly location: Location,
    private readonly toast: ToastrService,
    private readonly referidoService: ReferidoService,
    private readonly comunasService: ComunaService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly router: ActivatedRoute
  ) {
    this.id = this.router.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      referidoPor: [''],
      isInterno: [true, Validators.required],
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
      fechaNacimiento: [''],
      esEmprendedor: [false],
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
    console.log(this.userRol);
    if (this.userRol != 'Líder') {
      this.getReferidos();
    } else {
      this.myData();
      this.enableSkeleton = false;
    }
    this.getComunas();
    if (this.id) {
      this.accion = 'Editar';
      this.title = this.accion + ' ' + 'referido';
      this.getReferido(this.id);
    }
  }

  myData() {
    this.referidoService.getReferidoByDocument(this.user.documento).then((res) => {
      console.log(res);
         this.referidos.push ({
           label: res.data.nombres + ' ' + res.data.apellidos,
           value: res.id
         })
    })

    this.form.patchValue({
      referidoPor: this.user.documento
    })

  }

  getReferido(documento: string) {
    this.referidoService
      .getReferido(documento)
      .then((res: BaseModel<ReferidoModel>) => {
        this.form.patchValue({
          referidoPor: res.data.referidoPor,
          isInterno: res.data.isInterno,
          documento: res.data.documento,
          nombres: res.data.nombres,
          apellidos: res.data.apellidos,
          celular: res.data.celular,
          email: res.data.email,
          fechaNacimiento: res.data.fechaNacimiento,
          esEmprendedor: res.data.esEmprendedor,
          comuna: res.data.comuna,
          barrio: res.data.comuna + ' - ' + res.data.barrio,
          direccion: res.data.direccion,
          camara: res.data.camara,
          senado: res.data.senado,
          iglesia: res.data.iglesia,
          lugarVotacion: res.data.lugarVotacion,
          mesaVotacion: res.data.mesaVotacion,
        });
      });
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
      next: (res) => {
        this.barrios = res.map((comuna: BaseModel<ComunaModel>) => ({
          label: comuna.data.barrio,
          value: comuna.data.barrio,
        }));
      },
      error: (err) => {
        console.error('Error getting lideres', err);
      },
      complete: () => {},
    });
  }

  getReferidos() {
    this.referidoService.getReferidoByIglesia(this.iglesia).subscribe({
      next: (res) => {
        this.referidos = res.map((referido: BaseModel<ReferidoModel>) => ({
          label:
            referido.data.nombres +
            ' ' +
            referido.data.apellidos +
            ' - ' +
            referido.id,
          value: referido.id,
        }));
        this.enableSkeleton = false;
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
    if (this.accion == 'Editar') {
      await this.editReferido();
      return;
    }
    await this.saveReferido();
  }

  async editReferido() {
    try {
      await this.referidoService.updateReferido(this.id!, {
        fechaModificacion: new Date().toISOString(),
        modificadoPor: this.auth.uidUser(),
        data: {
          ...this.form.value,
          comuna: this.form.get('barrio')?.value.split(' - ')[0].trim(),
          barrio: this.form.get('barrio')?.value.split(' - ')[1].trim(),
        },
      });
      this.location.back();
      this.toast.success('Referido actualizado correctamente');
    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el referido. Intente nuevamente.');
    }
  }

  async saveReferido() {
    const referido: BaseModel<ReferidoModel> = {
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
      data: {
        ...this.form.value,
        iglesia: this.iglesia,
        comuna: this.form.get('barrio')?.value.split(' - ')[0].trim(),
        barrio: this.form.get('barrio')?.value.split(' - ')[1].trim(),
      },
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
