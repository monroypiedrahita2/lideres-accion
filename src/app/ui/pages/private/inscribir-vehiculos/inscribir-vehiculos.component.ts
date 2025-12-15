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
      // Logic for assigning will go here.
      // For now, we'll just show the notification as requested.
      const dialogRef = this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Confirmación',
          description: `¿Estás seguro de asignar el vehículo ${vehiculo.placa}?`,
          type: 'info',
          showCancel: true,
          actionText: 'Asignar'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
           // Perform effective assignment here
           this.dialog.open(DialogNotificationComponent, {
              data: {
                title: 'Éxito',
                description: 'Vehículo asignado correctamente.',
                type: 'success'
              }
           });
        }
      });
  }

  eliminar(vehiculo: VehiculoModel) {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      data: {
        title: 'Confirmación',
        description: `¿Estás seguro de desasignar el vehículo ${vehiculo.placa}?`,
        type: 'warning',
        showCancel: true,
        actionText: 'Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
         // Perform effective deletion/unassignment here
         this.dialog.open(DialogNotificationComponent, {
            data: {
              title: 'Eliminado',
              description: 'Vehículo desasignado correctamente.',
              type: 'success'
            }
         });
      }
    });
  }
}
