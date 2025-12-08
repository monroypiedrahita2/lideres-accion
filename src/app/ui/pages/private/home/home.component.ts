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
import { MatIconModule } from '@angular/material/icon';
import { CardInfoComponent } from '../../../shared/components/modules/card-info/card-info.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogOpcionesVehicularComponent } from '../../../shared/dialogs/dialog-opciones-vehicular/dialog-opciones-vehicular.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SkeletonComponent,
    LogoComponent,
    MatIconModule,
    CardInfoComponent,
    MatDialogModule,
    DialogOpcionesVehicularComponent
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
    }
  }

  closeInfoPerfil() {
    this.showInfoPerfil = false;
  }


  opcionesVehiculo() {
    console.log('abrir dialogo');
      const dialogRef = this.dialog.open(DialogOpcionesVehicularComponent, {
      data: {name: 'mi-carro'},
      width: '300px',
    });

      dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
     console.log(result);
    });
  }


}
