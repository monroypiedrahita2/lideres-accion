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
import { TarjetaInformativaComponent } from '../../../../shared/components/modules/tarjeta-informativa/tarjeta-informativa.component';

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
    TarjetaInformativaComponent,
  ],
  templateUrl: './create-referido.component.html',
})
export class CreateReferidoComponent implements OnInit {
  id!: string | null;
  existDocument: boolean = false;
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
  private avanceTimeout: any;

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
    if (this.userRol != 'Líder') {
      this.getReferidos();
    } else {
      this.form.patchValue({ referidoPor: this.user.documento });
      this.enableSkeleton = false;
    }
    this.getComunas();
    if (this.id) {
      this.accion = 'Editar';
      this.title = this.accion + ' ' + 'referido';
      this.getReferido(this.id);
    } else {
      this.accion = 'Crear';
      this.loadFormFromLocalStorage();
      this.enableSkeleton = false;
      this.form.get('documento')?.valueChanges.subscribe((value) => {
        this.confirmDocument(value);
      });
       this.form.valueChanges.subscribe(value => {
    localStorage.setItem('form_referido_draft', JSON.stringify(value));
  });
    }
  }

  loadFormFromLocalStorage(): void {
  const savedData = localStorage.getItem('form_referido_draft');
  if (savedData) {
    const data = JSON.parse(savedData);
    this.form.patchValue(data, { emitEvent: false }); // Usamos { emitEvent: false } para evitar un bucle infinito
    this.toast.info('Se ha recuperado el progreso anterior del formulario.');
  }
}

  confirmDocument(value: string) {
    if (this.avanceTimeout) {
      clearTimeout(this.avanceTimeout);
    }
    this.avanceTimeout = setTimeout(() => {
      this.referidoService.existeReferido(value).then((res) => {
        if (res) {
          this.existDocument = res;
        }
      });
    }, 1000);
  }
  getReferido(documento: string) {
    this.referidoService
      .getReferido(documento)
      .then((res: BaseModel<ReferidoModel>) => {
        this.form.patchValue({
          documento: this.id,
          referidoPor: res.data.referidoPor,
          isInterno: res.data.isInterno,
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
        this.form.get('documento')?.disable();
      });
  }

  async goToPage(page: string) {
    if (this.accion == 'Editar') {
      this.form.get('documento')?.enable();
    }
    await this.copyDocument(page);
  }

  async copyDocument(page: string) {
    const documento = this.form.get('documento')?.value;
    if (documento.length <= 0) {
      this.toast.warning('Flata diligenciar el número de documento');
      return;
    }
    try {
      await navigator.clipboard.writeText(documento);
      window.open(page, '_blank');
    } catch {
      this.toast.error('Error al copiar el número de documento');
    }
    if (this.accion == 'Editar') {
      this.form.get('documento')?.disable();
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
          label: referido.data.nombres + ' ' + referido.data.apellidos,
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
    this.loading = true;
    if (this.form.invalid) {
      this.toast.warning('Falta diligenciar campos obligatorios');
      this.loading = false;
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
    this.loading = false;

    }
  }

  async saveReferido() {
    const referido: BaseModel<ReferidoModel> = {
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
      data: {
        ...this.form.value,
        iglesia: this.iglesia,
        comuna: this.form.get('barrio')?.value ? this.form.get('barrio')?.value.split('-')[0] : '',
        barrio: this.form.get('barrio')?.value ? this.form.get('barrio')?.value.split('-')[1] : '',
      },
    };
    try {
      const { documento, ...referidoSinDocumento } = referido as any;
      console.log(referidoSinDocumento);
      await this.referidoService.crearReferidoConIdDocumento(
        referidoSinDocumento,
        this.form.get('documento')?.value
      );
      localStorage.removeItem('form_referido_draft');
      this.location.back();
      this.toast.success('Referido creado correctamente');
    } catch (error) {
      this.toast.error('El referido ya existe o inténtelo más tarde');
      console.error(error);
      this.loading = false;

    }
  }
}
