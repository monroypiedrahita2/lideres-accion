import { AuthService } from './../../shared/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { NavComponent } from '../../shared/components/organism/nav/nav.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/modules/footer/footer.component';
import { UsuarioModel } from '../../../models/usuarios/usuario.model';
import { PerfilService } from '../../shared/services/perfil/perfil.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  standalone: true,
  imports: [RouterModule, NavComponent, RouterOutlet, FooterComponent],
  styleUrl: './private.component.css'
})
export class PrivateComponent implements OnInit {
  usuario!: UsuarioModel;

  constructor (private perfilService: PerfilService, private auth: AuthService) {}

  ngOnInit(): void {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      console.log(usuarioData)
      this.usuario = JSON.parse(usuarioData);
    } else {
      this.getusuario(this.auth.uidUser())
    }
  }

  async getusuario(id: string){
    try {
      this.usuario = await this.perfilService.getMiPerfil(id)
      localStorage.setItem('usuario', JSON.stringify(this.usuario))
    } catch (error) {
      console.error(error)
    }
  }
}
