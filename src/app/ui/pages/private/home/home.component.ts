import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
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
import { MatIconModule } from '@angular/material/icon';
import { CardInfoComponent } from '../../../shared/components/modules/card-info/card-info.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogOpcionesVehicularComponent } from '../../../shared/dialogs/dialog-opciones-vehicular/dialog-opciones-vehicular.component';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { DialogCasasApoyoComponent } from '../../../shared/dialogs/dialog-casas-apoyo/dialog-casas-apoyo.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SkeletonComponent,
    MatIconModule,
    CardInfoComponent,
    MatDialogModule,
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



  constructor(
    private readonly IglesiaService: IglesiaService,
    private readonly perfilService: PerfilService,
    private readonly auth: AuthService,
    public dialog: MatDialog

  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.showInfoPerfil = false;
    }, 5000);
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
      this.skeleton = false;
      this.openDialogNotification()
    }
  }

  openDialogNotification() {
    this.dialog.open(DialogNotificationComponent, {
      data: {title: 'Bienvenido', message: 'Debes acceder a MIS DATOS y registrar tu información.', bottons: 'one', type:'info'},
      width: '300px',
    });
  }

  closeInfoPerfil() {
    this.showInfoPerfil = false;
  }


  opcionesVehiculo() {
      this.dialog.open(DialogOpcionesVehicularComponent, {
      data: {name: 'mi-carro'},
      width: '300px',
    });
  }

  opcionesCasasApoyo() {
    this.dialog.open(DialogCasasApoyoComponent, {
      data: {name: 'mi-casa-apoyo'},
      width: '300px',
    });
  }


}
