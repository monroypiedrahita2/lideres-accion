import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { UsuarioComponent } from '../../../forms/permisos/usuario/usuario.component';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  standalone: true,
  imports: [CommonModule, UsuarioComponent, SkeletonComponent],
})
export class MiPerfilComponent implements OnInit {
  user!: UsuarioModel;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;

  constructor(
    private perfilService: PerfilService,
    private location: Location,
    private auth: AuthService,
    private toast: ToastrService
  ) {}

  async ngOnInit() {
    try {
      this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
      this.accion = this.user ? 'Editar' : 'Crear';
      this.enableSkeleton = false;
      this.emailEnabled = false;
    } catch (error) {
      console.error(error);
    }
  }

  async onSubmit(data: UsuarioModel) {
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

  async updateUser(data: UsuarioModel) {
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
