import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CasaApoyoModel } from '../../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../../models/base/base.model';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';

import { MatDialog } from '@angular/material/dialog';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';

@Component({
    selector: 'app-card-casa-apoyo',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatExpansionModule],
    templateUrl: './card-casa-apoyo.component.html',
    styleUrls: ['./card-casa-apoyo.component.scss']
})
export class CardCasaApoyoComponent {
    @Input() casa!: BaseModel<CasaApoyoModel> | any;
    @Input() showActions: boolean = true;
    @Input() showAssign: boolean = true;
    @Input() showUnassign: boolean = true;
    @Input() vehiculosDisponibles: VehiculoModel[] = [];
    @Output() onAsignar = new EventEmitter<BaseModel<CasaApoyoModel>>();
    @Output() onDesasignar = new EventEmitter<BaseModel<CasaApoyoModel>>();
    @Output() onVehiculoChanged = new EventEmitter<{ vehiculo: VehiculoModel, action: 'asociar' | 'desasociar' }>();

    vehiculos: VehiculoModel[] = [];
    vehiculosNoAsociados: VehiculoModel[] = [];
    isLoadingVehiculos: boolean = false;
    vehiculosLoaded: boolean = false;

    constructor(
        private dialog: MatDialog,
        private vehiculoService: VehiculoService
    ) { }

    asignar() {
        this.onAsignar.emit(this.casa);
    }

    desasignar() {
        this.onDesasignar.emit(this.casa);
    }

    onPanelOpened() {
        // Only load vehicles if not already loaded
        if (!this.vehiculosLoaded && this.casa.id) {
            this.loadVehiculos();
            // Use vehiculosDisponibles from parent instead of loading again
            this.vehiculosNoAsociados = this.vehiculosDisponibles;
        }
    }

    loadVehiculos() {
        this.isLoadingVehiculos = true;
        this.vehiculoService.getVehiculosByCasaApoyo(this.casa.id).subscribe({
            next: (vehiculos) => {
                this.vehiculos = vehiculos;
                this.vehiculosLoaded = true;
                this.isLoadingVehiculos = false;
            },
            error: (error) => {
                console.error('Error loading vehiculos:', error);
                this.isLoadingVehiculos = false;
            }
        });
    }


    loadVehiculosNoAsociados() {
        this.vehiculoService.getVehiculosAprobadosSinCasaByIglesia(this.casa.data.iglesiaId).subscribe({
            next: (vehiculos) => {
                this.vehiculosNoAsociados = vehiculos;
            },
            error: (error) => {
                console.error('Error loading vehiculos no asociados:', error);
            }
        });
    }

    asociarVehiculo(vehiculo: VehiculoModel) {
        if (!vehiculo.id) {
            console.error('No se puede asociar un vehículo sin ID');
            return;
        }

        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: {
                title: 'Confirmación',
                message: `¿Está seguro de que desea asociar el vehículo ${vehiculo.placa} a esta casa de apoyo?`,
                type: 'warning',
                bottons: 'two',
                actionText: 'Asociar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const updatedVehiculo: VehiculoModel = {
                    ...vehiculo,
                    casaApoyoId: this.casa.id
                };

                this.vehiculoService.updateVehiculo(vehiculo.id!, updatedVehiculo).then(() => {
                    // Update local lists without making new API calls
                    this.vehiculos.push(vehiculo);
                    this.vehiculosNoAsociados = this.vehiculosNoAsociados.filter(v => v.id !== vehiculo.id);

                    // Notify parent to update its list
                    this.onVehiculoChanged.emit({ vehiculo: vehiculo, action: 'asociar' });

                    // Show success notification
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Éxito',
                            message: 'Vehículo asociado correctamente.',
                            type: 'success'
                        }
                    });
                }).catch((error) => {
                    console.error('Error al asociar el vehículo:', error);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Error',
                            message: 'Ocurrió un error al asociar el vehículo.',
                            type: 'error'
                        }
                    });
                });
            }
        });
    }

    desasociarVehiculo(vehiculo: VehiculoModel) {
        if (!vehiculo.id) {
            console.error('No se puede desasociar un vehículo sin ID');
            return;
        }

        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: {
                title: 'Confirmación',
                message: `¿Está seguro de que desea desasociar el vehículo ${vehiculo.placa}?`,
                type: 'warning',
                bottons: 'two',
                actionText: 'Desasociar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const updatedVehiculo: VehiculoModel = {
                    ...vehiculo,
                    casaApoyoId: null
                };

                this.vehiculoService.updateVehiculo(vehiculo.id!, updatedVehiculo).then(() => {
                    // Update local lists without making new API calls
                    this.vehiculos = this.vehiculos.filter(v => v.id !== vehiculo.id);
                    this.vehiculosNoAsociados.push(vehiculo);

                    // Notify parent to update its list
                    this.onVehiculoChanged.emit({ vehiculo: vehiculo, action: 'desasociar' });

                    // Show success notification
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Éxito',
                            message: 'Vehículo desasociado correctamente.',
                            type: 'success'
                        }
                    });
                }).catch((error) => {
                    console.error('Error al desasociar el vehículo:', error);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Error',
                            message: 'Ocurrió un error al desasociar el vehículo.',
                            type: 'error'
                        }
                    });
                });
            }
        });
    }
}
