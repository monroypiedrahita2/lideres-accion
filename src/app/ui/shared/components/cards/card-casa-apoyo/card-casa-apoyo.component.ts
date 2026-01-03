import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CasaApoyoModel } from '../../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../../models/base/base.model';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';

import { MatDialog } from '@angular/material/dialog';
import { DialogGestionVehiculosCasaComponent } from '../../../dialogs/dialog-gestion-vehiculos-casa/dialog-gestion-vehiculos-casa.component';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';

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
    @Output() onAsignar = new EventEmitter<BaseModel<CasaApoyoModel>>();
    @Output() onDesasignar = new EventEmitter<BaseModel<CasaApoyoModel>>();

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
            this.loadVehiculosNoAsociados();
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

    gestionarVehiculos() {
        const dialogRef = this.dialog.open(DialogGestionVehiculosCasaComponent, {
            data: {
                casaId: this.casa.id,
                vehiculos: this.vehiculos || [],
                iglesiaId: this.casa.data.iglesiaId
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Reload vehicles after dialog closes
                this.vehiculosLoaded = false;
                this.loadVehiculos();
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

        if (confirm(`¿Está seguro de que desea asociar el vehículo ${vehiculo.placa} a esta casa de apoyo?`)) {
            const updatedVehiculo: VehiculoModel = {
                ...vehiculo,
                casaApoyoId: this.casa.id
            };

            this.vehiculoService.updateVehiculo(vehiculo.id, updatedVehiculo).then(() => {
                // Reload vehicles after successful assignment
                this.vehiculosLoaded = false;
                this.loadVehiculos();
                this.loadVehiculosNoAsociados();
                console.log('Vehículo asociado exitosamente');
            }).catch((error) => {
                console.error('Error al asociar el vehículo:', error);
                alert('Error al asociar el vehículo');
            });
        }
    }

    desasociarVehiculo(vehiculo: VehiculoModel) {
        if (!vehiculo.id) {
            console.error('No se puede desasociar un vehículo sin ID');
            return;
        }

        if (confirm(`¿Está seguro de que desea desasociar el vehículo ${vehiculo.placa}?`)) {
            const updatedVehiculo: VehiculoModel = {
                ...vehiculo,
                casaApoyoId: null
            };

            this.vehiculoService.updateVehiculo(vehiculo.id, updatedVehiculo).then(() => {
                // Reload vehicles after successful unassignment
                this.vehiculosLoaded = false;
                this.loadVehiculos();
                this.loadVehiculosNoAsociados();
                console.log('Vehículo desasociado exitosamente');
            }).catch((error) => {
                console.error('Error al desasociar el vehículo:', error);
                alert('Error al desasociar el vehículo');
            });
        }
    }
}
