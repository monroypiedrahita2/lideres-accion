import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { UsuarioComponent } from '../../../../forms/usuario/usuario.component';
import { SkeletonComponent } from '../../../../shared/components/organism/skeleton/skeleton.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { InputSelectComponent } from '../../../../shared/components/atoms/input-select/input-select.component';
import { SubTitleComponent } from '../../../../shared/components/atoms/sub-title/sub-title.component';
import { SelectOptionModel } from '../../../../../models/base/select-options.model';
import { ReferidoModel } from '../../../../../models/referido/referido.model';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';

@Component({
  selector: 'app-create-referido',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonComponent,
    ReactiveFormsModule,
    ContainerGridComponent,
    InputSelectComponent,
    InputTextComponent,
    SubTitleComponent,
  ],
  templateUrl: './create-referido.component.html',
})
export class CreateReferidoComponent implements OnInit {
  user!: any;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;
  title: string = this.accion + ' ' + 'referido';
  form!: FormGroup;
  referidos: SelectOptionModel<string>[] = [];

  constructor(
    private readonly location: Location,
    private readonly toast: ToastrService,
    private readonly referidoService: ReferidoService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly liderService: LiderService
  ) {
    this.form = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      isInterno: [false, Validators.required],
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
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion: ['', Validators.required],
      iglesia: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    try {
      this.getReferidos();
      this.accion = 'Crear';
      this.enableSkeleton = false;
      this.emailEnabled = false;
    } catch (error) {
      console.error(error);
      this.enableSkeleton = false;
    }
  }

  getReferidos() {
    this.liderService.getLideres().subscribe({
      next: (res) => {
        this.referidos = res.map((lider: BaseModel<ReferidoModel>) => ({
          label:
            lider.data.id +
            ' - ' +
            lider.data.nombres +
            ' ' +
            lider.data.apellidos,
          value: lider.id,
        }));
      },
      error: (err) => {
        console.error('Error getting lideres', err);
      },
      complete: () => {},
    });
  }

  async onSubmit(data: ReferidoModel) {
    const user: BaseModel<ReferidoModel> = {
      data: data,
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
    };
    console.log('referido', user);
    await this.saveReferido(user);
  }

  async saveReferido(user: BaseModel<ReferidoModel>) {
    const referido: BaseModel<ReferidoModel> = {
      ...user,
      data: {
        ...user.data,
        referidoPor: this.form.value.referidoPor,
      },
    };
    console.log('referido', referido);
    try {
      await this.referidoService.crearReferidoConIdDocumento(
        referido,
        referido.data.id
      );
      this.location.back();
      this.toast.success('Referido creado correctamente');
    } catch (error) {
      this.toast.error('El referido ya existe o inténtelo más tarde');
      console.error(error);
    }
  }
}
