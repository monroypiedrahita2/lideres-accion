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
    public dialog: MatDialog,
    private readonly testigoService: TestigoService,
    private readonly vehiculoService: VehiculoService
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
      barrioDondeVive: ['', Validators.required],
    });
  }

  ngOnInit() {
    (async () => {
      try {
        this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
        if (this.user) {
          this.usuario = this.user;
          this.actualizarForm(this.user);
          this.form.get('email')?.disable();
          this.form.get('documento')?.disable();
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
      barrioDondeVive: user.barrioDondeVive,
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

  async onSubmit() {
    this.form.get('email')?.enable();
    const user: PerfilModel = {
      documento: this.form.value.documento,
      nombres: this.form.value.nombres,
      apellidos: this.form.value.apellidos,
      celular: this.form.value.celular,
      email: this.form.value.email,
      barrioDondeVive: this.form.value.barrioDondeVive,
      rol: this.usuario.rol || null,
      coordinadorCasaApoyo: this.form.value.casaApoyo
        ? this.usuario.coordinadorCasaApoyo || null
        : null, // Clear if unchecked
      postulado: {
        casaApoyo: this.form.value.casaApoyo,
        transporte: this.form.value.transporte,
        testigo: this.form.value.testigo,
      },
    };

    this.loading = true;

    if (this.accion == 'Editar') {
      await this.checkAndRemoveRoles(); // Check removal before or during update
      await this.updateUser(user);
      return;
    }

    // Check if document exists before creating
    const documentExists = await firstValueFrom(this.perfilService.getPerfilByDocumento(user.documento?.toString() || ''));
    if (documentExists && documentExists.length > 0) {
      this.toast.error('El documento ya existe, por favor verifique.');
      this.loading = false;
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
      localStorage.setItem('usuario', JSON.stringify({ ...this.usuario, ...data }));

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
