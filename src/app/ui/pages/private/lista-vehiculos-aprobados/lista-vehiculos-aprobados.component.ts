import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { CardVehiculoComponent } from '../../../shared/components/cards/card-vehiculo/card-vehiculo.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';

@Component({
  selector: 'app-inscribir-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    CardVehiculoComponent,
    TitleComponent
  ],
  templateUrl: './lista-vehiculos-aprobados.component.html',
})
export class ListaVehiculosAprobadosComponent implements OnInit {
  private readonly vehiculoService = inject(VehiculoService);
  private readonly dialog = inject(MatDialog);
  usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Change type to match service return (BaseModel<VehiculoModel> or just VehiculoModel depending on how it's used, 
  // but let's stick to what we saw in the service: observable returns BaseModel<VehiculoModel>[])
  vehiculos: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.getVehiculos();
  }

  getVehiculos() {
    this.loading = true;
    this.vehiculoService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }


  asignar(vehiculo: VehiculoModel) {
    if (!this.usuario.iglesia) {
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Error',
          message: 'No tienes una iglesia asignada para realizar esta acción.',
          type: 'error'
        }
      });
      return;
    }

    if (vehiculo.iglesiaId) {
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Error',
          message: vehiculo.iglesiaId === this.usuario.iglesia ? 'El vehículo ya se encuentra asignado a tu iglesia.' : 'El vehículo ya se encuentra asignado a otra iglesia.',
          type: vehiculo.iglesiaId === this.usuario.iglesia ? 'warning' : 'error'
        }
      });
      return;
    }

    this.vehiculoService.updateVehiculo(vehiculo.id!, { ...vehiculo, iglesiaId: this.usuario.iglesia }).then(async () => {
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Éxito',
          message: 'Vehículo asignado correctamente.',
          type: 'success'
        }
      });
      this.getVehiculos(); // Refresh list
    }).catch(err => {
      console.error(err);
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Error',
          message: 'Ocurrió un error al asignar el vehículo.',
          type: 'error'
        }
      });
    });
  }

  desasignar(vehiculo: VehiculoModel) {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      data: {
        title: 'Confirmación',
        message: `¿Estás seguro de desasignar el vehículo ${vehiculo.placa}?`,
        type: 'warning',
        bottons: 'two',
        actionText: 'Desasignar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehiculoService.updateVehiculo(vehiculo.id!, { ...vehiculo, iglesiaId: null }).then(async () => {
          // Verification step
          try {
            const updatedVehiculo = await this.vehiculoService.getMyVehiculo(vehiculo.id!);
            if (!updatedVehiculo.iglesiaId) { // Check if it is null or undefined
              this.dialog.open(DialogNotificationComponent, {
                data: {
                  title: 'Desasignado',
                  message: 'Vehículo desasignado correctamente.',
                  type: 'success'
                }
              });
              this.getVehiculos(); // Refresh list
            } else {
              throw new Error('Verification failed');
            }
          } catch (error) {
            console.error('Verification failed', error);
            this.dialog.open(DialogNotificationComponent, {
              data: {
                title: 'Error',
                message: 'No se pudo verificar la desasignación del vehículo.',
                type: 'error'
              }
            });
          }
        }).catch(err => {
          console.error(err);
          this.dialog.open(DialogNotificationComponent, {
            data: {
              title: 'Error',
              message: 'Ocurrió un error al desasignar el vehículo.',
              type: 'error'
            }
          });
        });
      }
    });
  }
}
