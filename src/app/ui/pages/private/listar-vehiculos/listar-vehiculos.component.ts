import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { CardVehiculoComponent } from '../../../shared/components/cards/card-vehiculo/card-vehiculo.component';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from "../../../shared/components/atoms/title/title.component";

@Component({
    selector: 'app-listar-vehiculos',
    standalone: true,
    imports: [CommonModule, CardVehiculoComponent, MatIconModule, TitleComponent],
    templateUrl: './listar-vehiculos.component.html',
    styleUrls: ['./listar-vehiculos.component.scss']
})
export class ListarVehiculosComponent implements OnInit {
    private readonly vehiculoService = inject(VehiculoService);
    private readonly dialog = inject(MatDialog);
    vehiculos: VehiculoModel[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    ngOnInit() {
        this.loadVehiculos();
    }

    loadVehiculos() {
        if (this.usuario.iglesia) {
            this.vehiculoService.getVehiculosByIglesia(this.usuario.iglesia).subscribe({
                next: (data) => {
                    this.vehiculos = data;
                },
                error: (err) => console.error(err)
            });
        }
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
                this.vehiculoService.updateVehiculo(vehiculo.id!, { ...vehiculo, iglesiaId: null }).then(() => {
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Desasignado',
                            message: 'Vehículo desasignado correctamente.',
                            type: 'success'
                        }
                    });
                    // Ideally we re-fetch, but since it's a real-time listener (obs) it might update automatically depending on how the service is implemented. 
                    // In typical firestore collectionData, it updates automatically.
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
