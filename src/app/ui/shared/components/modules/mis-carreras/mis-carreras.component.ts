import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateCarreraModel, PostuladosIdsModel } from '../../../../../models/carrera/carrera.model';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';
import { CarreraService } from '../../../services/carrera/carrera.service';
import { AuthService } from '../../../services/auth/auth.service';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';
import { firstValueFrom } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { IconWhatsappComponent } from '../../atoms/icon-whatsapp/icon-whatsapp.component';

@Component({
    selector: 'app-mis-carreras',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        IconButtonComponent,
        IconWhatsappComponent
    ],
    templateUrl: './mis-carreras.component.html',
    styleUrls: ['./mis-carreras.component.scss']
})
export class MisCarrerasComponent implements OnInit {
    misCarreras: CreateCarreraModel[] = [];
    postulantesData: Map<string, VehiculoModel> = new Map();
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
            this.misCarreras = creadas.sort((a, b) => {
                const priority: { [key: string]: number } = {
                    'Abierto': 1,
                    'En ruta': 2,
                    'Finalizada': 3,
                    'Cancelada': 4
                };

                const priorityA = priority[a.estado as string] || 99;
                const priorityB = priority[b.estado as string] || 99;

                return priorityA - priorityB;
            });
            this.loadPostulantesData();
            this.loadingMisCarreras = false;
        });
    }

    loadPostulantesData() {
        this.misCarreras.forEach(carrera => {
            if (carrera.estado === 'Abierto' && carrera.postulados) {
                carrera.postulados.forEach(postulado => {
                    if (postulado.id && !this.postulantesData.has(postulado.id)) {
                        this.vehiculoService.getVehiculoById(postulado.id).subscribe(vehiculo => {
                            if (vehiculo) {
                                this.postulantesData.set(postulado.id!, vehiculo);
                            }
                        });
                    }
                });
            }
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

            // Actualizar estado del vehiculo a 'En carrera'
            await this.actualizarEstadoVehiculo(postulacion.id, 'En carrera');

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

    private async actualizarEstadoVehiculo(vehiculoId: string, estado: 'Activo' | 'En carrera') {
        try {
            // Se asume que updateVehiculo actualiza parcialmente si le pasamos un objeto (aunque la firma pida VehiculoModel completo, firestore updateDoc maneja parciales)
            // Casteamos a any para evitar error de tipado estricto si updateVehiculo pide VehiculoModel completo
            await this.vehiculoService.updateVehiculo(vehiculoId, { estado } as any);
        } catch (error) {
            console.error(`Error actualizando estado del vehiculo ${vehiculoId} a ${estado}`, error);
        }
    }

    getTiempoAproximado(postulado: PostuladosIdsModel, carrera: CreateCarreraModel): string {
        if (!postulado.latitud || !postulado.longitud || !carrera.latitudSolicitante || !carrera.longitudSolicitante) return '';
        const dist = this.getDistanceFromLatLonInKm(
            postulado.latitud,
            postulado.longitud,
            carrera.latitudSolicitante,
            carrera.longitudSolicitante
        ) * 4;

        const timeHours = dist / 30;
        const timeMinutes = Math.round(timeHours * 60 * 2);

        return `${timeMinutes} min`;
    }

    getDistanciaAproximado(postulado: PostuladosIdsModel, carrera: CreateCarreraModel): string {
        if (!postulado.latitud || !postulado.longitud || !carrera.latitudSolicitante || !carrera.longitudSolicitante) return '';
        const dist = this.getDistanceFromLatLonInKm(
            postulado.latitud,
            postulado.longitud,
            carrera.latitudSolicitante,
            carrera.longitudSolicitante
        ) * 3.5;

        return `${dist.toFixed(2)} km`;
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

    async eliminarPostulacion(carrera: CreateCarreraModel, postulacion: PostuladosIdsModel) {
        if (!carrera.id || !postulacion.id) return;

        try {
            await this.carreraService.cancelarPostulacion(carrera.id, postulacion);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Postulación Eliminada',
                    message: 'El conductor ha sido eliminado de los postulados.',
                    type: 'success',
                    bottons: 'one'
                }
            });
        } catch (error) {
            console.error('Error al eliminar postulación', error);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Error',
                    message: 'Hubo un problema al eliminar la postulación.',
                    type: 'error',
                    bottons: 'one'
                }
            });
        }
    }

    async desasignarVehiculo(carrera: CreateCarreraModel) {
        if (!carrera.id) return;

        try {
            const vehiculoId = carrera.vehiculoIdAprobado;
            await this.carreraService.eliminarVehiculoSeleccionado(carrera.id);

            // Si habia un vehiculo aprobado, revertir su estado a 'Activo'
            if (vehiculoId) {
                await this.actualizarEstadoVehiculo(vehiculoId, 'Activo');
            }
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Selección Eliminada',
                    message: 'El vehículo ha sido desasignado y la carrera está abierta nuevamente.',
                    type: 'success',
                    bottons: 'one'
                }
            });
        } catch (error) {
            console.error('Error al desasignar vehículo', error);
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: 'Error',
                    message: 'Hubo un problema al desasignar el vehículo.',
                    type: 'error',
                    bottons: 'one'
                }
            });
        }
    }

    eliminarCarrera(carrera: CreateCarreraModel) {
        if (!carrera.id) return;

        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            width: '400px',
            data: {
                title: 'Eliminar Carrera',
                message: '¿Estás seguro de que deseas eliminar esta carrera? Esta acción no se puede deshacer.',
                type: 'danger',
                bottons: 'two'
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const vehiculoId = carrera.vehiculoIdAprobado;

                    await this.carreraService.deleteCarrera(carrera.id!);

                    // Si habia vehiculo aprobado, liberarlo
                    if (vehiculoId) {
                        await this.actualizarEstadoVehiculo(vehiculoId, 'Activo');
                    }
                    this.dialog.open(DialogNotificationComponent, {
                        width: '400px',
                        data: {
                            title: 'Carrera Eliminada',
                            message: 'La carrera ha sido eliminada exitosamente.',
                            type: 'success',
                            bottons: 'one'
                        }
                    });
                    // Ideally, the list is reactive or we reload it. 
                    // Since it's using an observable that might not auto-refresh if it's not a real-time listener on the exact same query that respects deletions immediately or if the component needs a nudge. 
                    // However, getCarrerasCreadasPor uses collectionData which is reactive.
                } catch (error) {
                    console.error('Error al eliminar carrera', error);
                    this.dialog.open(DialogNotificationComponent, {
                        width: '400px',
                        data: {
                            title: 'Error',
                            message: 'Hubo un problema al eliminar la carrera.',
                            type: 'error',
                            bottons: 'one'
                        }
                    });
                }
            }
        });
    }

    deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
}
