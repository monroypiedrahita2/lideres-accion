import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../../shared/components/atoms/logo/logo.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { DURATION_ALERTS } from '../../../shared/const/duration-alerts.const';
import { NAME_LONG_APP } from '../../../shared/const/name-app.const';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoComponent, InputTextComponent, MatIconModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  nameApp = NAME_LONG_APP;
  loading = false
  showPasswordLogin = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly _snackBar: MatSnackBar,
    private readonly toast: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async loginWithGoogle() {
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['./']);
    } catch (error) {
      console.error(error)
      this.toast.error('Inicio de sesión incorrecto')
    }
  }

  async login() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.loading = true;
    try {
      await this.auth.login(email, password);
      if (this.auth.isEmailVerified(this.auth.getAuth().currentUser)) {
        this.router.navigate(['./private/home']);
        this.toast.success('Gracias por tu ayuda, bienvenido')
      } else {
        await this.auth.logout();
        this.toast.warning('Por favor verifica tu correo electrónico para ingresar.');
      }
      this.loading = false;
    } catch (error) {
      console.error(error)
      this.toast.error('Inicio de sesión incorrecto')
      this.loading = false;
    }
  }

  openSnackBar(text: string) {
    this._snackBar.open(text, 'cerrar', {
      duration: DURATION_ALERTS.LONG
    });
  }
}
