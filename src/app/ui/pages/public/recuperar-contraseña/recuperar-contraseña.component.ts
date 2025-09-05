import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-recuperar-contraseña',
  templateUrl: './recuperar-contraseña.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    InputTextComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
})
export class RecuperarContraseñaComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private location: Location,
    private toast: ToastrService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async recuperar() {
    if (this.form.invalid) {
      return;
    }
    try {
      await this.authService.resetPassword(this.form.value.email);
      this.toast.success(
        'Se ha enviado un correo para restablecer tu contraseña'
      );
      this.location.back();
    } catch (error) {
      this.toast.error(
        'Ha ocurrido un error al intentar restablecer tu contraseña'
      );
    }
  }



  back() {
    this.location.back();
  }
}
