import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../../shared/components/atoms/logo/logo.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { DURATION_ALERTS } from '../../../shared/const/duration-alerts.const';
import { NAME_APP, NAME_LONG_APP } from '../../../shared/const/name-app.const';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoComponent, InputTextComponent],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup; 
  nameApp = NAME_LONG_APP;
  loading = false

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private toast: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // async loginWithGoogle() {
  //   try {
  //     await this.auth.loginWithGoogle();
  //     this.router.navigate(['./']);
  //   } catch (error) {
  //     console.error(error)
  //     this.toast.error('Inicio de sesión incorrecto')
  //   }
  // }

  async login() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.loading = true;
    try {
      await this.auth.login(email, password);
      this.router.navigate(['./private/home']);
      this.toast.success('Bienvenido a LIDA')
      this.loading = false;
    } catch (error) {
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
