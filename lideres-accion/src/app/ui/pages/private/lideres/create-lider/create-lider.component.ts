import { Component, OnInit } from '@angular/core';

import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { UsuarioComponent } from '../../../../forms/usuario/usuario.component';
import { UsuarioModel } from '../../../../../models/usuarios/usuario.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, Location } from '@angular/common';
import { SkeletonComponent } from '../../../../shared/components/organism/skeleton/skeleton.component';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { AuthService } from '../../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-create-lider',
  standalone: true,
  imports: [CommonModule, UsuarioComponent, SkeletonComponent],
  providers: [LugaresService],
  templateUrl: './create-lider.component.html',
})
export class CreateLiderComponent implements OnInit {
  user!: UsuarioModel;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;
  title: string = this.accion + ' ' + 'líder';

  constructor(
    private location: Location,
    private toast: ToastrService,
    private liderService: LiderService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    try {
      this.accion = 'Crear';
      this.enableSkeleton = false;
      this.emailEnabled = false;
    } catch (error) {
      console.error(error);
      this.enableSkeleton = false;
    }
  }

  async onSubmit(data: UsuarioModel) {
    const user: BaseModel<UsuarioModel> = {
      data: data,
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
      id: data.documento,
    };
    try {
      if (user.id) {
        await this.liderService.crearLiderConIdDocumento(user, user.id);
        this.location.back();
        this.toast.success('Líder creado correctamente');
      } else {
        this.toast.error('Error en crear el líder');
      }
    } catch (error) {
      this.toast.error('El líder ya existe o inténtelo más tarde');
    }
  }

  updateLider() {}
}
