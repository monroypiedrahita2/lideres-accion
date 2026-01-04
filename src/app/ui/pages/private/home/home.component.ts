import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { IglesiaModel } from './../../../../models/iglesia/iglesia.model';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NAME_LONG_APP } from '../../../shared/const/name-app.const';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { ContainerAlertInformationComponent } from '../../../shared/components/modules/container-alert-information/container-alert-information.component';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { TestigoService } from '../../../shared/services/testigo/testigo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SkeletonComponent,
    MatIconModule,
    MatDialogModule,
    ContainerAlertInformationComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  skeleton: boolean = true;
  nameLong: string = NAME_LONG_APP;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesiaData: IglesiaModel = JSON.parse(
    localStorage.getItem('iglesiaData') || '{}'
  );
  showInfoPerfil: boolean = true;

  // Status flags
  vehiculoStatus: string | null = null;
  casaApoyoStatus: string | null = null;
  testigoStatus: string | null = null;

  get isProfileIncomplete(): boolean {
    return !this.usuario.nombres || !this.usuario.apellidos || !this.usuario.documento;
  }

  get isChurchMissing(): boolean {
    return !this.isProfileIncomplete && !this.usuario.iglesia;
  }

  constructor(
    private readonly IglesiaService: IglesiaService,
    private readonly perfilService: PerfilService,
    private readonly auth: AuthService,
    public dialog: MatDialog,
    private readonly vehiculoService: VehiculoService,
    private readonly casaApoyoService: CasaApoyoService,
    private readonly testigoService: TestigoService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.showInfoPerfil = false;
    }, 5000);
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      this.usuario = JSON.parse(usuarioData);
      this.perfilService.setCurrentUser(this.usuario); // Notify subscribers
      if (!this.iglesiaData && this.usuario.iglesia) {
        this.getMyIglesia(this.usuario.iglesia!);
      }
      this.loadPostulacionesInfo();
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
      this.perfilService.setCurrentUser(this.usuario); // Notify subscribers
      if (this.usuario.iglesia) {
        this.getMyIglesia(this.usuario.iglesia!);
      } else {
        this.openDialogMissingChurch();
      }
      this.loadPostulacionesInfo();
      this.skeleton = false;
    } catch (error) {
      console.error(error);
      this.skeleton = false;
      this.openDialogNotification()
    }
  }

  loadPostulacionesInfo() {
    if (this.usuario.postulado?.transporte && this.usuario.id) {
      this.vehiculoService.getVehiculoByConductor(this.usuario.id).subscribe(vehiculos => {
        if (vehiculos && vehiculos.length > 0) {
          this.vehiculoStatus = vehiculos[0].aprobado ? 'Aprobado' : 'Pendiente';
        } else {
          this.vehiculoStatus = 'No registrado';
        }
      });
    }

    if (this.usuario.postulado?.casaApoyo && this.usuario.id) {
      this.casaApoyoService.getCasasApoyoByResponsable(this.usuario.id).subscribe(casas => {
        if (casas && casas.length > 0) {
          // Accessing data property since it returns BaseModel
          const casa = casas[0].data;
          this.casaApoyoStatus = casa.aprobado ? 'Aprobado' : 'Pendiente';
        } else {
          this.casaApoyoStatus = 'No registrado';
        }
      });
    }

    if (this.usuario.postulado?.testigo && this.usuario.documento) {
      this.testigoService.getTestigoByDocument(this.usuario.documento)
        .then(testigo => {
          if (testigo) {
            this.testigoStatus = (testigo.puestodevotacion && testigo.mesadevotacion) ? 'Asignado' : 'Pendiente de asignación';
          } else {
            this.testigoStatus = 'No registrado';
          }
        })
        .catch(() => {
          this.testigoStatus = 'No registrado';
        });
    }
  }

  openDialogNotification() {
    this.dialog.open(DialogNotificationComponent, {
      data: { title: 'Bienvenido', message: 'Debes acceder a MIS DATOS y registrar tu información.', bottons: 'one', type: 'info' },
      width: '300px',
    });
  }

  openDialogMissingChurch() {
    this.dialog.open(DialogNotificationComponent, {
      data: {
        title: 'Atención',
        message: 'Debes comunicarte con algún coordinador de iglesia para que te asocie a la iglesia a la que perteneces y que vas a apoyar',
        bottons: 'one',
        type: 'info'
      },
      width: '300px',
    });
  }

  closeInfoPerfil() {
    this.showInfoPerfil = false;
  }

  getBorderColor(status: string | null): string {
    switch (status) {
      case 'Aprobado':
      case 'Asignado':
        return 'border-green-500';
      case 'Pendiente':
      case 'Pendiente de asignación':
        return 'border-yellow-500';
      case 'No registrado':
        return 'border-gray-500';
      default:
        return 'border-red-500';
    }
  }

  getTextColor(status: string | null): string {
    switch (status) {
      case 'Aprobado':
      case 'Asignado':
        return 'text-green-600';
      case 'Pendiente':
      case 'Pendiente de asignación':
        return 'text-yellow-600';
      case 'No registrado':
        return 'text-gray-600';
      default:
        return 'text-red-600';
    }
  }
}
