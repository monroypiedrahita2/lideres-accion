import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, InputTextComponent, TitleComponent, ReactiveFormsModule, ButtonComponent],
})
export class MiPerfilComponent implements OnInit {
  form!: FormGroup
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
    private readonly toast: ToastrService
  ) {
    this.form = this.fb.group({
      documento: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      testigo: [false],
      casaApoyo: [false],
      transporte: [false],
    });
  }

  ngOnInit() {
    (async () => {
      try {
        this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
        console.log(this.user);
        this.form.patchValue(this.user);
        this.accion = this.user ? 'Editar' : 'Crear';
        this.form.get('email')?.disable();
        this.emailEnabled = false;
        this.enableSkeleton = false;
      } catch (error) {
        console.error(error);
        this.enableSkeleton = false;
      }
    })();
  }

  submit() {

  }

  crear() {

  }

  editar () {

  }

  back() {
    this.location.back();
  }

  async onSubmit(data: any) {
    this.loading = true;
    if (this.accion == 'Editar') {
      await this.updateUser(data);
      return;
    }
    try {
      await this.perfilService.crearPerfilConUId(data, this.auth.uidUser());
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
    } catch {
      this.toast.error('Error al actualizar el usuario. Intente nuevamente.');
      this.loading = false;
    }
  }
}
