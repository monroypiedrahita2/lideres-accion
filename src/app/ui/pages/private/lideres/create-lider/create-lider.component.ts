import { Component, OnInit } from '@angular/core';

import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { UsuarioComponent } from '../../../../forms/usuario/usuario.component';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, Location } from '@angular/common';
import { SkeletonComponent } from '../../../../shared/components/organism/skeleton/skeleton.component';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { ReferidoModel } from '../../../../../models/referido/referido.model';

@Component({
  selector: 'app-create-lider',
  standalone: true,
  imports: [CommonModule, UsuarioComponent, SkeletonComponent],
  providers: [LugaresService],
  templateUrl: './create-lider.component.html',
})
export class CreateLiderComponent implements OnInit {
  user!: any;
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;
  title: string = this.accion + ' ' + 'líder';

  constructor(
    private readonly location: Location,
    private readonly toast: ToastrService,
    private readonly liderService: LiderService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    try {
      this.accion = 'Crear';
      this.enableSkeleton = false;
      this.emailEnabled = false;
    } catch (error) {
      console.error(error);
      this.enableSkeleton = false;
    }
  }

  async onSubmit(data: ReferidoModel) {
    const user: BaseModel<ReferidoModel> = {
      data: data,
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser(),
    };
    try {
      console.log(user);
      if (user) {
        await this.liderService.crearLiderConIdDocumento(user, user.data.id);
        this.location.back();
        this.toast.success('Líder creado correctamente');
      } else {
        this.toast.error('Error en crear el líder');
      }
    } catch (error) {
      console.error(error);
      this.toast.error('El líder ya existe o inténtelo más tarde');
    }
  }

  updateLider() {}
}
