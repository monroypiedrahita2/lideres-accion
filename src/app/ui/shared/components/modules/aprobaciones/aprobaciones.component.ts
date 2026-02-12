import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateCarreraModel } from '../../../../../models/carrera/carrera.model';
import { CarreraService } from '../../../services/carrera/carrera.service';
import { AuthService } from '../../../services/auth/auth.service';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { IconWhatsappComponent } from '../../atoms/icon-whatsapp/icon-whatsapp.component';

@Component({
    selector: 'app-aprobaciones',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        IconButtonComponent,
        IconWhatsappComponent
    ],
    templateUrl: './aprobaciones.component.html',
    styleUrls: ['./aprobaciones.component.scss']
})
export class AprobacionesComponent implements OnInit {
    aprobaciones: CreateCarreraModel[] = [];
    loading: boolean = false;

    constructor(
        private carreraService: CarreraService,
        private authService: AuthService,
        private vehiculoService: VehiculoService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadAprobaciones();
    }

    async loadAprobaciones() {
        this.loading = true;
        const uid = this.authService.uidUser();

        this.vehiculoService.getVehiculoByConductor(uid).subscribe(vehiculos => {
            if (vehiculos && vehiculos.length > 0 && vehiculos[0].id) {
                const vehiculoId = vehiculos[0].id;
                this.carreraService.getCarrerasAsignadasAVehiculo(vehiculoId).subscribe(asignadas => {
                    this.aprobaciones = asignadas.sort((a, b) => {
                        const priority: { [key: string]: number } = {
                            'En ruta': 1,
                            'Finalizada': 2
                        };

                        const priorityA = priority[a.estado as string] || 99;
                        const priorityB = priority[b.estado as string] || 99;

                        return priorityA - priorityB;
                    });
                    this.checkNewApprovals();
                    this.loading = false;
                });
            } else {
                this.loading = false;
            }
        });
    }

    @Output() hasActiveRace = new EventEmitter<boolean>();

    private lastNotifiedRaceId: string | undefined;

    checkNewApprovals() {
        const activeRace = this.aprobaciones.find(c => c.estado === 'En ruta');
        const hasActive = !!activeRace;

        this.hasActiveRace.emit(hasActive);

        if (activeRace && activeRace.id !== this.lastNotifiedRaceId) {
            this.lastNotifiedRaceId = activeRace.id;
            this.dialog.open(DialogNotificationComponent, {
                width: '400px',
                data: {
                    title: '¡Nueva Carrera Aprobada!',
                    message: `Tienes una carrera activa hacia ${activeRace.puestoVotacionIr || 'el puesto de votación'}.`,
                    type: 'success',
                    bottons: 'one'
                }
            });
        } else if (!activeRace) {
            this.lastNotifiedRaceId = undefined;
        }
    }

    openMapCoordinates(lat: number | undefined, lng: number | undefined) {
        if (!lat || !lng) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }

    openMapQuery(query: string) {
        if (!query) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }

    getStatusColor(status: string | undefined): string {
        switch (status) {
            case 'Abierto': return 'text-yellow-600 bg-yellow-100 border-yellow-200'; // Mapped 'Pendiente' to 'Abierto' based on model
            case 'En ruta': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'Finalizada': return 'text-green-600 bg-green-100 border-green-200';
            case 'Cancelada': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    }

    isActive(carrera: CreateCarreraModel): boolean {
        return carrera.estado === 'En ruta';
    }

    finalizarCarrera(carrera: CreateCarreraModel) {
        if (!carrera.id) return;

        this.dialog.open(DialogNotificationComponent, {
            width: '400px',
            data: {
                title: 'Finalizar Carrera',
                message: '¿Estás seguro que deseas finalizar esta carrera?',
                type: 'info',
                bottons: 'two'
            }
        }).afterClosed().subscribe(res => {
            if (res) {
                this.carreraService.finalizarCarrera(carrera.id!).then(() => {
                    this.dialog.open(DialogNotificationComponent, {
                        width: '400px',
                        data: {
                            title: 'Carrera Finalizada',
                            message: 'La carrera ha sido finalizada exitosamente.',
                            type: 'success',
                            bottons: 'one'
                        }
                    });
                }).catch(err => {
                    console.error('Error finalizando carrera', err);
                    this.dialog.open(DialogNotificationComponent, {
                        width: '400px',
                        data: {
                            title: 'Error',
                            message: 'Hubo un error al finalizar la carrera.',
                            type: 'danger',
                            bottons: 'one'
                        }
                    });
                });
            }
        });
    }
}
