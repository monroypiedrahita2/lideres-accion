import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonComponent,
    InputTextComponent,
    TitleComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
})
export class MiPerfilComponent implements OnInit {
  form!: FormGroup;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

  user!: any;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly toast: ToastrService,
    public dialog: MatDialog
  ) {
    this.form = this.fb.group({
      documento: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      testigo: [false],
      casaApoyo: [false],
      transporte: [false],
    });
  }

  ngOnInit() {
    (async () => {
      try {
        this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
        if (this.user) {
          this.actualizarForm(this.user);
          this.form.get('email')?.disable();
          this.accion = 'Editar';
        }
        this.enableSkeleton = false;
      } catch (error) {
        this.form.get('email')?.enable();
        this.accion = 'Crear';
        console.log('email auth', this.auth.getEmail());
        this.form.patchValue({
          email: this.auth.getEmail(),
        });
         this.form.get('email')?.disable();
        console.error(error);
        this.enableSkeleton = false;
      }
    })();
  }

  actualizarForm(user: PerfilModel) {
    this.form.patchValue({
      documento: user.documento,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      celular: user.celular,
      testigo: user.postulado?.testigo || false,
      casaApoyo: user.postulado?.casaApoyo || false,
      transporte: user.postulado?.transporte || false,
    });
  }

  back() {
    this.location.back();
  }

  async onSubmit() {
    this.form.get('email')?.enable();
    const user: PerfilModel = {
      documento: this.form.value.documento,
      nombres: this.form.value.nombres,
      apellidos: this.form.value.apellidos,
      celular: this.form.value.celular,
      email: this.form.value.email,
      rol: this.usuario.rol || null,
      postulado: {
        casaApoyo: this.form.value.casaApoyo,
        transporte: this.form.value.transporte,
        testigo: this.form.value.testigo,
      },
    };
    console.log(user);

    this.loading = true;
    if (this.accion == 'Editar') {
      await this.updateUser(user);
      return;
    }
    try {
      await this.perfilService.crearPerfilConUId(user, this.auth.uidUser());
      this.toast.success('Perfil de la app creado ');
      this.location.back();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear el perfil. Intente nuevamente.');
    } finally {
      this.loading = false;
    }
  }

  async updateUser(data: any) {
    try {
      await this.perfilService.updatePerfil(this.auth.uidUser(), data);
      this.toast.success('Usuario actualizado');
      this.location.back();
      localStorage.setItem('usuario', JSON.stringify({...this.usuario, ...data}));

    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el usuario. Intente nuevamente.');
      this.loading = false;
    }
  }

  openDialogNotificaciones(title: string, message: string, buttonText: string) {
    this.dialog.open(DialogNotificationComponent, {
      data: {
        title: 'Uusari',
        message:
          'Aquí puedes gestionar tus preferencias de notificaciones. Próximamente podrás activar o desactivar las notificaciones push desde esta sección.',
        buttonText: 'one',
      },
    });
  }
}
