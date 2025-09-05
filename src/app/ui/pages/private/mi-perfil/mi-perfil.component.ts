import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UsuarioComponent } from '../../../forms/usuario/usuario.component';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  standalone: true,
  imports: [CommonModule, UsuarioComponent, SkeletonComponent],
})
export class MiPerfilComponent implements OnInit {
  user!: any;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;

  constructor(
    private readonly perfilService: PerfilService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly toast: ToastrService
  ) {}

  ngOnInit() {
    (async () => {
      try {
        this.user = await this.perfilService.getMiPerfil(this.auth.uidUser());
        this.accion = this.user ? 'Editar' : 'Crear';
        this.emailEnabled = false;
        this.enableSkeleton = false;
      } catch (error) {
        console.error(error);
        this.enableSkeleton = false;
      }
    })();
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
