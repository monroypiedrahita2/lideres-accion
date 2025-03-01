import { Component } from '@angular/core';

import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { UsuarioComponent } from '../../../../forms/permisos/usuario/usuario.component';

@Component({
  selector: 'app-create-lider',
  standalone: true,
  imports: [
    UsuarioComponent
  ],
  providers: [LugaresService],
  templateUrl: './create-lider.component.html',
})
export class CreateLiderComponent {



}
