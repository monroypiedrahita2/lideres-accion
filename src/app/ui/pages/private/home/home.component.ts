import { ReferidoService } from './../../../shared/services/referido/referido.service';
import { IglesiaService } from './../../../shared/services/iglesia/iglesia.service';
import { IglesiaModel } from './../../../../models/iglesia/iglesia.model';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModel } from '../../../../models/utils/card.model';
import { CARDS_HOME } from '../../../shared/const/cards.const';
import { NAME_LONG_APP } from '../../../shared/const/name-app.const';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { LogoComponent } from '../../../shared/components/atoms/logo/logo.component';
import { CardEstadisticasComponent } from '../../../shared/components/organism/card-estadisticas/card-estadisticas.component';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SkeletonComponent,
    LogoComponent,
    CardEstadisticasComponent,
    MatIconModule,
    ButtonComponent
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  skeleton: boolean = true;
  cards: CardModel[] = CARDS_HOME;
  nameLong: string = NAME_LONG_APP;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesiaData: IglesiaModel = JSON.parse(
    localStorage.getItem('iglesiaData') || '{}'
  );
  showInfoPerfil: boolean = true;
  totalRegistros: number = 0;
  totalInternos: number = 0;
  totalExternos: number = 0;
  emprendedores: number = 0;
  senado: number = 0;
  camara: number = 0;
  sinPuesto: number = 0;
  showCounters: boolean = false;


  constructor(
    private readonly IglesiaService: IglesiaService,
    private readonly perfilService: PerfilService,
    private readonly auth: AuthService,
    private readonly referidoService: ReferidoService

  ) {}

  ngOnInit(): void {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      this.usuario = JSON.parse(usuarioData);
      if (!this.iglesiaData) {
        this.getMyIglesia(this.usuario.iglesia!);
      }
      this.skeleton = false;
    } else {
      this.getusuario(this.auth.uidUser());
    }
  }

  async getMyIglesia(i: string) {
    const iglesia = await this.IglesiaService.getMyIglesia(i);
    this.iglesiaData = iglesia.data;
    localStorage.setItem('iglesiaData', JSON.stringify(this.iglesiaData));
    this.skeleton = false;
  }

  async getusuario(id: string) {
    try {
      this.usuario = await this.perfilService.getMiPerfil(id);
      localStorage.setItem(
        'usuario',
        JSON.stringify({ ...this.usuario, id: id })
      );
      this.getMyIglesia(this.usuario.iglesia!);
      this.skeleton = false;
    } catch (error) {
      console.error(error);
    }
  }

  closeInfoPerfil() {
    this.showInfoPerfil = false;
  }

  async contarReferidos() {
  this.showCounters = true;
  this.totalRegistros = await this.referidoService.countActiveIf('data.iglesia', this.usuario.iglesia)
  this.totalInternos = await this.referidoService.countActiveIf('data.isInterno', true)
  this.totalExternos = await this.referidoService.countActiveIf('data.isInterno', false)
  this.emprendedores = await this.referidoService.countActiveIf('data.esEmprendedor', true)
  this.senado = await this.referidoService.countActiveIf('data.senado', true)
  this.camara = await this.referidoService.countActiveIf('data.camara', true)
  this.sinPuesto = await this.referidoService.countActiveIf('data.lugarVotacion', '')
  }
}
