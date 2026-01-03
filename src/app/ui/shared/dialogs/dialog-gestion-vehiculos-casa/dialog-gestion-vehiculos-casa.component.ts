
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CasaApoyoService } from '../../services/casa-apoyo/casa-apoyo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { DialogAsignarVehiculoComponent } from '../dialog-asignar-vehiculo/dialog-asignar-vehiculo.component';
import { DialogNotificationComponent } from '../dialog-notification/dialog-nofication.component';

@Component({
    selector: 'app-dialog-gestion-vehiculos-casa',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, ButtonComponent],
    templateUrl: './dialog-gestion-vehiculos-casa.component.html',
    styleUrls: ['./dialog-gestion-vehiculos-casa.component.scss']
})
export class DialogGestionVehiculosCasaComponent implements OnInit {
    vehiculos: VehiculoModel[] = [];
    casaId: string;

    constructor(
        public dialogRef: MatDialogRef<DialogGestionVehiculosCasaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaId: string, vehiculos: VehiculoModel[], iglesiaId: string },
        private casaApoyoService: CasaApoyoService,
        private dialog: MatDialog
    ) {
        this.casaId = data.casaId;
        this.vehiculos = data.vehiculos || [];
    }

    ngOnInit(): void { }

    openAddVehiculo() {
        const dialogRef = this.dialog.open(DialogAsignarVehiculoComponent, {
            data: {
                casaId: this.casaId,
                iglesiaId: this.data.iglesiaId
            }
        });

        dialogRef.afterClosed().subscribe(addedVehiculos => {
            if (addedVehiculos && Array.isArray(addedVehiculos)) {
                this.vehiculos.push(...addedVehiculos);
                // No need to call addVehiculoToCasa manually if dialog handles it, 
                // but if dialog returns just the objects, we might need to.
                // Plan said dialog HANDLES SAVING. 
                // So here we likely just update local view.
            }
        });
    }

    addVehiculo(vehiculo: VehiculoModel) {
        // Check if already exists
        if (this.vehiculos.some(v => v.placa === vehiculo.placa)) {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Ya existe',
                    message: 'El vehículo ya está asignado a esta casa.',
                    type: 'warning'
                }
            });
            return;
        }

        this.casaApoyoService.addVehiculoToCasa(this.casaId, vehiculo).then(() => {
            this.vehiculos.push(vehiculo);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: 'Vehículo agregado correctamente.',
                    type: 'success'
                }
            });
        }).catch(err => {
            console.error(err);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: 'No se pudo agregar el vehículo.',
                    type: 'error'
                }
            });
        });
    }

    removeVehiculo(vehiculo: VehiculoModel) {
        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: {
                title: 'Confirmación',
                message: `¿Estás seguro de eliminar el vehículo ${vehiculo.placa}?`,
                type: 'warning',
                bottons: 'two',
                actionText: 'Eliminar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.casaApoyoService.removeVehiculoFromCasa(this.casaId, vehiculo).then(() => {
                    this.vehiculos = this.vehiculos.filter(v => v.placa !== vehiculo.placa);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Eliminado',
                            message: 'Vehículo eliminado correctamente.',
                            type: 'success'
                        }
                    });
                }).catch(err => {
                    console.error(err);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Error',
                            message: 'No se pudo eliminar el vehículo.',
                            type: 'error'
                        }
                    });
                });
            }
        });
    }

    close() {
        this.dialogRef.close(this.vehiculos);
    }
}
