import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';

@Component({
  selector: 'app-inscribir-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    InputTextComponent
  ],
  templateUrl: './inscribir-vehiculos.component.html',
})
export class InscribirVehiculosComponent {
  private readonly vehiculoService = inject(VehiculoService);
  private readonly dialog = inject(MatDialog);
  usuario = JSON.parse(localStorage.getItem('usuario') || '{}');


  searchControl = new FormControl('', [Validators.required]);
  vehiculos: VehiculoModel[] = [];
  loading = false;
  hasSearched = false;

  search() {
    if (this.searchControl.invalid) return;

    this.loading = true;
    this.hasSearched = true;
    const placa = this.searchControl.value!;

    this.vehiculoService.getVehiculoByPlaca(placa.toUpperCase()).subscribe({
      next: (data: any[]) => {
        // The service returns Observable<BaseModel<VehiculoModel>[]> based on previous reading
        this.vehiculos = data as unknown as VehiculoModel[];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.vehiculos = [];
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
        this.search(); // Refresh list
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
                   this.search(); // Refresh list
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
