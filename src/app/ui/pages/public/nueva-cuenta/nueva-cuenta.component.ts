import { lastValueFrom } from 'rxjs';
import { IglesiaService } from './../../../shared/services/iglesia/iglesia.service';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { BaseModel } from '../../../../models/base/base.model';
import { SelectOptionModel } from '../../../../models/base/select-options.model';

@Component({
  selector: 'app-nueva-cuenta',
  templateUrl: './nueva-cuenta.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    InputTextComponent,
    InputSelectComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
})
export class NuevaCuentaComponent implements OnInit {
  form!: FormGroup;
  iglesias: SelectOptionModel<string>[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly perfilService: PerfilService,
    private readonly iglesiaService: IglesiaService,
    private readonly location: Location,
    private readonly toast: ToastrService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      iglesia: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirm: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.getIglesias();
  }

  getIglesias() {
    this.iglesiaService.getIglesias().subscribe({
      next: (resp) => {
        this.iglesias = resp.map((iglesia: BaseModel<IglesiaModel>) => ({
          label: iglesia.data.nombre,
          value: iglesia.id!,
        }));
      },
      error: (error) => {
        console.error(error);
        this.toast.error('Error al cargar las iglesias');
      },
    });
  }

  async crear() {
    if (
      this.form.invalid &&
      this.form.value.password !== this.form.value.confirm
    ) {
      return;
    }
    try {
      await this.authService
        .createUserWithEmailAndPassword(
          this.form.value.email,
          this.form.value.password
        )
        .then(async (userCredential) => {
          await this.crearNuevaCuenta(userCredential.user.uid);
        });
    } catch {
      this.toast.error(
        'Error al crear la cuenta. Intente nuevamente. Ya existe una cuenta con ese correo.'
      );
    }
  }

  async crearNuevaCuenta(uid: string) {
    try {
      await this.perfilService.crearPerfilConUId(
        {
          nombres: this.form.value.nombres,
          apellidos: this.form.value.apellidos,
        },
        uid
      );
      this.toast.success('Cuenta creada exitosamente');
      this.location.back();
    } catch {
      this.toast.error('Error al crear el perfil. Intente nuevamente.');
    }
  }

  back() {
    this.location.back();
  }
}
