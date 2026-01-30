import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { IglesiaModel } from './../../../../models/iglesia/iglesia.model';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
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
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { TestigoAsociadoService } from '../../../shared/services/testigo-asociado/testigo-asociado.service';
import { BaseModel } from '../../../../models/base/base.model';
import { TestigoAsociadoModel } from '../../../../models/testigo-asociado/testigo-asociado.model';
import { DialogCrearCarreraComponent } from '../../../shared/dialogs/dialog-crear-carrera/dialog-crear-carrera.component';

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
    MatExpansionModule,
    ButtonComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  skeleton: boolean = true;
  nameLong: string = NAME_LONG_APP;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesiaData: IglesiaModel = JSON.parse(
    localStorage.getItem('iglesiaData') || '{}'
  );
  showInfoPerfil: boolean = true;
  userPhotoUrl: string | null = null;

  // Status flags
  vehiculoStatus: string | null = null;
  casaApoyoStatus: string | null = null;
  testigoStatus: string | null = null;

  // Data
  casaApoyoVehiculos: VehiculoModel[] = [];

  get isProfileIncomplete(): boolean {
    return !this.usuario.nombres || !this.usuario.apellidos;
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
    private readonly testigoService: TestigoService,
    private readonly testigoAsociadoService: TestigoAsociadoService,
    private readonly router: Router
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
      this.userPhotoUrl = this.auth.getPhotoUrl();
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
      this.userPhotoUrl = this.auth.getPhotoUrl();
      this.skeleton = false;
    } catch (error) {
      console.error(error);
      this.skeleton = false;
      this.openDialogNotification()
    }
  }

  // Details info
  testigoInfo: { puesto: string, mesa: string } | null = null;
  vehiculoInfo: { casaApoyo: string; direccion?: string; barrio?: string; responsableTelefono?: string } | null = null;
  misTestigos: BaseModel<TestigoAsociadoModel>[] = [];

  loadPostulacionesInfo() {
    const uid = this.auth.uidUser();

    if (this.usuario.postulado?.transporte && uid) {
      this.vehiculoService.getVehiculoByConductor(uid).subscribe(vehiculos => {
        if (vehiculos && vehiculos.length > 0) {
          const vehiculo = vehiculos[0];
          this.currentVehiculo = vehiculo;
          this.vehiculoStatus = vehiculo.aprobado ? 'Aprobado' : 'Pendiente';

          if (vehiculo.casaApoyoId) {
            this.casaApoyoService.getCasaApoyo(vehiculo.casaApoyoId).then(casa => {
              if (casa && casa.data) {
                this.vehiculoInfo = {
                  casaApoyo: casa.data.nombreHabitante || 'Casa asignada',
                  direccion: casa.data.direccion,
                  barrio: casa.data.barrio,
                  responsableTelefono: casa.data.responsableTelefono
                };
              }
            });
          }
        } else {
          this.vehiculoStatus = 'No registrado';
        }
      });
    }

    if (this.usuario.postulado?.casaApoyo && uid) {
      this.casaApoyoService.getCasasApoyoByResponsable(uid).subscribe(casas => {
        if (casas && casas.length > 0) {
          // Accessing data property since it returns BaseModel
          const casa = casas[0].data;
          const casaId = casas[0].id; // We need the ID to fetch vehicles
          this.casaApoyoStatus = casa.aprobado ? 'Aprobado' : 'Pendiente';

          if (casa.aprobado && casaId) {
            this.vehiculoService.getVehiculosByCasaApoyo(casaId).subscribe(vehiculos => {
              this.casaApoyoVehiculos = vehiculos;
            });
          }

        } else {
          this.casaApoyoStatus = 'No registrado';
        }
      });
    }

    if (this.usuario.postulado?.testigo && uid) {
      this.testigoService.getTestigoByDocument(uid)
        .then((testigo: any) => {
          if (testigo) {
            // Check if data is wrapped in 'data' property (BaseModel) or direct
            const testigoData = testigo.data ? testigo.data : testigo;
            const asignado = testigoData.puestodevotacion && testigoData.mesadevotacion;

            this.testigoStatus = asignado ? 'Asignado' : 'Pendiente de asignación';
            if (asignado) {
              this.testigoInfo = {
                puesto: testigoData.puestodevotacion,
                mesa: testigoData.mesadevotacion
              };
            }

            // Fetch associated witnesses for Coordinador
            this.testigoAsociadoService.getTestigosByCoordinador(uid).subscribe(witnesses => {
              this.misTestigos = witnesses;
            });

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

  // Vehicle status management
  currentVehiculo: VehiculoModel | null = null;

  updateVehiculoStatus(estado: 'Activo' | 'Inactivo' | 'En carrera') {
    if (this.currentVehiculo && this.currentVehiculo.id) {
      this.vehiculoService.updateVehiculo(this.currentVehiculo.id, { ...this.currentVehiculo, estado: estado }).then(() => {
        if (this.currentVehiculo) {
          this.currentVehiculo.estado = estado;
        }
      });
    }
  }

  // Helper for UI class
  getStatusColor(estado: string | undefined): string {
    switch (estado) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-red-100 text-red-800';
      case 'En carrera': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  goToResultados() {
    this.router.navigate(['/private/enviar-resultados-votacion']);
  }

  openDialogCrearCarrera() {
    this.dialog.open(DialogCrearCarreraComponent, {
      width: '400px',
      data: { usuario: this.usuario }
    });
  }
}
