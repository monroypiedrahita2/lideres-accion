import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateCarreraModel, PostuladosIdsModel } from '../../../../../../models/carrera/carrera.model';
import { CarreraService } from '../../../../../shared/services/carrera/carrera.service';
import { AuthService } from '../../../../../shared/services/auth/auth.service';
import { VehiculoService } from '../../../../../shared/services/vehiculo/vehiculo.service';
import { firstValueFrom } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../../../shared/dialogs/dialog-notification/dialog-nofication.component';

@Component({
    selector: 'app-mis-carreras',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './mis-carreras.component.html',
    styleUrls: ['./mis-carreras.component.scss']
})
export class MisCarrerasComponent implements OnInit {
    misCarreras: CreateCarreraModel[] = [];
    loadingMisCarreras: boolean = false;

    constructor(
        private carreraService: CarreraService,
        private authService: AuthService,
        private vehiculoService: VehiculoService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadMisCarreras();
    }

    async loadMisCarreras() {
        this.loadingMisCarreras = true;
        const uid = this.authService.uidUser();

        this.carreraService.getCarrerasCreadasPor(uid).subscribe(creadas => {
            this.misCarreras = creadas;

            this.vehiculoService.getVehiculoByConductor(uid).subscribe(vehiculos => {
                if (vehiculos && vehiculos.length > 0 && vehiculos[0].id) {
                    const vehiculoId = vehiculos[0].id;
                    this.carreraService.getCarrerasAsignadasAVehiculo(vehiculoId).subscribe(asignadas => {
                        const combined = [...this.misCarreras, ...asignadas];
                        const unique = new Map();
                        combined.forEach(c => unique.set(c.id, c));
                        this.misCarreras = Array.from(unique.values());
                    });
                }
            });
            this.loadingMisCarreras = false;
        });
    }

    async aprobarConductor(carrera: CreateCarreraModel, postulacion: PostuladosIdsModel) {
        if (!postulacion.id) return;
        try {
            const vehiculo = await firstValueFrom(this.vehiculoService.getVehiculoById(postulacion.id));

            if (!vehiculo) {
                this.dialog.open(DialogNotificationComponent, {
                    width: '400px',
                    data: {
                        title: 'Error',
                        message: 'No se encontró información del vehículo.',
                        type: 'error',
                        bottons: 'one'
                    }
                });
                return;
            }

            const datosConductor = {
                nombre: `${vehiculo.nombre} ${vehiculo.apellidos}`,
                telefono: vehiculo.celular,
                foto: vehiculo.foto || '',
                placaVehiculo: vehiculo.placa,
                modeloVehiculo: vehiculo.modelo,
                colorVehiculo: vehiculo.color
            };

            await this.carreraService.aprobarConductor(carrera.id!, postulacion.id, '', datosConductor);

            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: '¡Exitoso!',
                    message: 'Conductor aprobado y carrera en ruta.',
                    type: 'success',
                    bottons: 'one'
                }
            });

        } catch (error) {
            console.error('Error al aprobar conductor', error);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Error',
                    message: 'Hubo un problema al aprobar el conductor.',
                    type: 'error',
                    bottons: 'one'
                }
            });
        }
    }

    getDistanciaPostulado(postulado: PostuladosIdsModel, carrera: CreateCarreraModel): string {
        if (!postulado.latitud || !postulado.longitud || !carrera.latitudSolicitante || !carrera.longitudSolicitante) return '';
        const dist = this.getDistanceFromLatLonInKm(
            postulado.latitud,
            postulado.longitud,
            carrera.latitudSolicitante,
            carrera.longitudSolicitante
        );
        return `${dist.toFixed(1)} km`;
    }

    getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
}
