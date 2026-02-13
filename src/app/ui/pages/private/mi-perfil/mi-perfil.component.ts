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
import { UserPhotoComponent } from '../../../shared/components/atoms/user-photo/user-photo.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatDialog } from '@angular/material/dialog';
import { TestigoService } from '../../../shared/services/testigo/testigo.service';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { firstValueFrom } from 'rxjs';

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
    UserPhotoComponent,
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
  foto: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly toast: ToastrService,
    public dialog: MatDialog,
    private readonly testigoService: TestigoService,
    private readonly vehiculoService: VehiculoService
  ) {
    this.form = this.fb.group({

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
    this.foto = this.auth.getFoto();
    (async () => {
      try {
        this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
        if (this.user) {
          this.usuario = this.user;
          this.actualizarForm(this.user);
          this.form.get('email')?.disable();

          this.accion = 'Editar';
        }
        this.enableSkeleton = false;
      } catch (error) {
        this.form.get('email')?.enable();
        this.accion = 'Crear';
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

  async checkAndRemoveRoles() {
    let notificationNeeded = false;
    const uid = this.auth.uidUser();

    // Check Testigo
    if (this.usuario.postulado?.testigo && !this.form.value.testigo) {
      try {
        await this.testigoService.deleteTestigo(uid);
        notificationNeeded = true;
      } catch (e) {
        console.error('Error deleting testigo', e);
      }
    }

    // Check Transporte (Vehiculo)
    if (this.usuario.postulado?.transporte && !this.form.value.transporte) {
      try {
        const vehicles$ = this.vehiculoService.getVehiculoByConductor(uid);
        const vehicles = await firstValueFrom(vehicles$);
        if (vehicles && vehicles.length > 0) {
          for (const vehicle of vehicles) {
            if (vehicle.id) await this.vehiculoService.deleteVehiculo(vehicle.id);
          }
        }
        notificationNeeded = true;
      } catch (e) {
        console.error('Error deleting vehiculo', e);
      }
    }

    // Check Casa Apoyo
    if (this.usuario.postulado?.casaApoyo && !this.form.value.casaApoyo) {
      // Logic handled in updateUser data construction (clearing coordinadorCasaApoyo)
      notificationNeeded = true;
    }

    if (notificationNeeded) {
      this.openDialogNotificaciones(
        'Atención',
        'Al cancelar el apoyo debe avisar al pastor de ya no poder ayudar, gracias.',
        'Entendido'
      );
    }
  }

  async removePhoto() {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      data: {
        title: 'Atención',
        message: '¿Está seguro de eliminar su foto de perfil?',
        bottons: 'two',
        type: 'warning',
      },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      this.foto = null;
    }
  }

  async onSubmit() {
    const rawValue = this.form.getRawValue();
    const user: PerfilModel = {
      foto: this.foto || null,
      nombres: rawValue.nombres,
      apellidos: rawValue.apellidos,
      celular: rawValue.celular,
      email: rawValue.email,
      rol: this.usuario.rol || null,
      coordinadorCasaApoyo: rawValue.casaApoyo
        ? this.usuario.coordinadorCasaApoyo || null
        : null, // Clear if unchecked
      postulado: {
        casaApoyo: rawValue.casaApoyo,
        transporte: rawValue.transporte,
        testigo: rawValue.testigo,
      },
      noCuenta: rawValue.noCuenta || this.generateNoCuenta(),
      apruebaUsodeDatos: this.usuario.apruebaUsodeDatos || false,
    };


    if (this.accion == 'Crear') {
      const dialogRef = this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Autorización de Datos',
          message:
            'Autorizo de manera voluntaria, previa, explícita, informada e inequívoca el tratamiento de mis datos personales para la recolección, almacenamiento, uso, circulación y supresión de los mismos, conforme a la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios.',
          bottons: 'two',
          type: 'info',
        },
      });

      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        this.toast.info('No se guardo la información, se canceló.');
        return;
      }
      user.apruebaUsodeDatos = true;
    }

    this.loading = true;

    if (this.accion == 'Editar') {
      await this.checkAndRemoveRoles(); // Check removal before or during update
      await this.updateUser(user);
      return;
    }
    try {
      await this.perfilService.crearPerfilConUId(user, this.auth.uidUser());
      localStorage.setItem(
        'usuario',
        JSON.stringify({ ...user, id: this.auth.uidUser() })
      );
      this.toast.success('Perfil de la app creado ');
      this.location.back();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al crear el perfil. Intente nuevamente.');
    } finally {
      this.loading = false;
    }
  }

  generateNoCuenta(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async updateUser(data: any) {
    try {
      await this.perfilService.updatePerfil(this.auth.uidUser(), data);
      localStorage.setItem(
        'usuario',
        JSON.stringify({ ...this.usuario, ...data })
      );
      this.toast.success('Usuario actualizado');
      this.location.back();

    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el usuario. Intente nuevamente.');
      this.loading = false;
    }
  }

  openDialogNotificaciones(title: string, message: string, buttonText: string) {
    this.dialog.open(DialogNotificationComponent, {
      data: {
        title: title,
        message: message,
        buttonText: buttonText,
      },
    });
  }
}
