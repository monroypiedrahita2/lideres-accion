import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleComponent,
    InputTextComponent,
    ButtonComponent,
  ],
})
export class CreateUserComponent {
  form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private location: Location,
    private authService: AuthService,
    private toast: ToastrService
    
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    });
  }

  back() {
    this.location.back();
  }

  async createUser() {
    if (this.form.invalid) {
      return;
    }
    try {
      await this.authService.createUserWithEmailAndPassword(
        this.form.value.email,
        this.form.value.password
      );
      this.toast.success('Usuario creado correctamente');
      this.authService.logout();
      this.location.go('/public/login');
    } catch (error) {
      console.error(error);
      this.toast.error('Error, inténtelo de nuevo')
    }
  }

  openSnackBar(text: string) {
  }
}
