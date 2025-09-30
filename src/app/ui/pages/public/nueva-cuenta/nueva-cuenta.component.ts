import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-nueva-cuenta',
  templateUrl: './nueva-cuenta.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
})
export class NuevaCuentaComponent {
  form!: FormGroup;
  iglesias: SelectOptionModel<string>[] = [];
  disableBtn: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly perfilService: PerfilService,
    private readonly location: Location,
    private readonly toast: ToastrService
  ) {
    this.form = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirm: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  async crear() {
    this.disableBtn = true;
    if (
      this.form.invalid &&
      this.form.value.password !== this.form.value.confirm
    ) {
      return;
    }
    try {
      const user: PerfilModel = {
        documento: this.form.value.documento,
        nombres: this.form.value.nombres,
        apellidos: this.form.value.apellidos,
        email: this.form.value.email,
        rol: null,
      }
      await this.authService
        .createUserWithEmailAndPassword(
          this.form.value.email,
          this.form.value.password
        )
        .then(async (userCredential) => {
          this.toast.info('Creando cuenta...');
          await this.crearNuevaCuenta(user, userCredential.user.uid);
        });
    } catch (error) {
      this.toast.error(
        'Error al crear la cuenta. Intente nuevamente. Ya existe una cuenta con ese correo.'
      );
      console.error(error);
      this.disableBtn = false;
    }
  }

  async crearNuevaCuenta(user: PerfilModel, uid: string) {
    try {
      await this.perfilService.crearPerfilConUId(
        user,
        uid
      );
      this.toast.success('Cuenta creada exitosamente');
      this.location.back();
    } catch {
      this.toast.error('Error al crear el perfil. Intente nuevamente.');
        this.disableBtn = false;
    }
  }

  back() {
    this.location.back();
  }
}
