import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateCarreraModel, PostuladosIdsModel } from '../../../../../../models/carrera/carrera.model';
import { CarreraService } from '../../../../../shared/services/carrera/carrera.service';
import { AuthService } from '../../../../../shared/services/auth/auth.service';
import { VehiculoService } from '../../../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../../../models/vehiculo/vehiculo.model';
import { firstValueFrom } from 'rxjs';
import { DialogNotificationComponent } from '../../../../../shared/dialogs/dialog-notification/dialog-nofication.component';

// Local interface to extend model with display properties without modifying global model
interface CarreraWithDistance extends CreateCarreraModel {
    distancia?: string;
    tiempoEstimado?: number;
}

@Component({
    selector: 'app-buscar-carrera',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './buscar-carrera.component.html',
    styleUrls: ['./buscar-carrera.component.scss']
})
export class BuscarCarreraComponent implements OnInit {
    carrerasDisponibles: CarreraWithDistance[] = [];
    loadingBuscar: boolean = false;
    vehiculoActivo: VehiculoModel | null = null;
    vehiculoMensaje: string = '';
    userLocation: { lat: number, lng: number } | null = null;

    constructor(
        private carreraService: CarreraService,
        private authService: AuthService,
        private vehiculoService: VehiculoService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.getUserLocation();
        this.checkVehiculoAndLoadDisponibles();
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    if (this.carrerasDisponibles.length > 0) {
                        this.calculateDistances();
                    }
                },
                (error) => {
                    console.error('Error getting location', error);
                }
            );
        }
    }

    async checkVehiculoAndLoadDisponibles() {
        this.loadingBuscar = true;
        const uid = this.authService.uidUser();

        if (!uid) {
            this.vehiculoMensaje = 'Debes iniciar sesión para buscar carreras.';
            this.loadingBuscar = false;
            return;
        }

        try {
            const vehiculos = await firstValueFrom(this.vehiculoService.getVehiculoByConductor(uid));
            if (vehiculos && vehiculos.length > 0) {
                const vehiculo = vehiculos[0];
                if (vehiculo.aprobado && vehiculo.estado === 'Activo') {
                    this.vehiculoActivo = vehiculo;
                    this.loadCarrerasDisponibles(vehiculo.tipoVehiculo);
                } else {
                    this.vehiculoMensaje = 'Tu vehículo no está aprobado o no está en estado "Activo".';
                }
            } else {
                this.vehiculoMensaje = 'No tienes un vehículo registrado para tomar carreras.';
            }
        } catch (error) {
            console.error('Error checking vehicle', error);
            this.vehiculoMensaje = 'Error al verificar información del vehículo.';
        } finally {
            this.loadingBuscar = false;
        }
    }

    loadCarrerasDisponibles(tipoVehiculo: string) {
        const uid = this.authService.uidUser();
        this.carreraService.getCarrerasDisponibles(tipoVehiculo).subscribe(carreras => {
            // Filter out races created by me
            this.carrerasDisponibles = carreras.filter(c => c.creadaPor !== uid);

            if (this.userLocation) {
                this.calculateDistances();
            }
        });
    }

    calculateDistances() {
        if (!this.userLocation) return;

        this.carrerasDisponibles = this.carrerasDisponibles.map(carrera => {
            if (carrera.latitudSolicitante && carrera.longitudSolicitante) {
                const dist = this.getDistanceFromLatLonInKm(
                    this.userLocation!.lat,
                    this.userLocation!.lng,
                    carrera.latitudSolicitante,
                    carrera.longitudSolicitante
                );
                const timeHours = dist / 30;
                const timeMinutes = Math.round(timeHours * 60);

                return {
                    ...carrera,
                    distancia: dist.toFixed(1),
                    tiempoEstimado: timeMinutes
                } as CarreraWithDistance;
            }
            return carrera;
        });

        this.carrerasDisponibles.sort((a, b) => {
            if (a.distancia && b.distancia) return Number(a.distancia) - Number(b.distancia);
            return 0;
        });
    }

    async postularse(carrera: CreateCarreraModel) {
        if (!this.vehiculoActivo || !this.vehiculoActivo.id) return;
        if (!this.userLocation) {
            alert('Necesitamos tu ubicación para postularte.');
            return;
        }

        const postulacion: PostuladosIdsModel = {
            id: this.vehiculoActivo.id,
            latitud: this.userLocation.lat,
            longitud: this.userLocation.lng
        };

        try {
            await this.carreraService.postularse(carrera.id!, postulacion);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: '¡Exitoso!',
                    message: 'Te has postulado correctamente a la carrera.',
                    type: 'success',
                    bottons: 'one'
                }
            });
        } catch (error) {
            console.error('Error al postularse', error);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Error',
                    message: 'Hubo un problema al postularse. Inténtalo de nuevo.',
                    type: 'error',
                    bottons: 'one'
                }
            });
        }
    }

    getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371;
        var dLat = this.deg2rad(lat2 - lat1);
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    getWhatsAppLink(telefono: string): string {
        return `https://wa.me/${telefono}`;
    }
}
