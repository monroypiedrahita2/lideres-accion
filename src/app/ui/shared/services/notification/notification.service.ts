import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DialogNotificationComponent } from '../../dialogs/dialog-notification/dialog-nofication.component'; // Verify path
import { CreateCarreraModel } from '../../../../models/carrera/carrera.model'; // Verify path
import { CarreraService } from '../carrera/carrera.service'; // Verify path
import { VehiculoService } from '../vehiculo/vehiculo.service'; // Verify path

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private aprobacionesSubject = new BehaviorSubject<CreateCarreraModel[]>([]);
    public aprobaciones$ = this.aprobacionesSubject.asObservable();

    private lastNotifiedRaceId: string | undefined;
    private subscription: Subscription | undefined;

    constructor(
        private auth: Auth,
        private vehiculoService: VehiculoService,
        private carreraService: CarreraService,
        private dialog: MatDialog
    ) {
        this.init();
    }

    init() {
        // Listen to auth state changes
        user(this.auth).pipe(
            switchMap(user => {
                if (user) {
                    // If logged in, get vehicle and then assigned races
                    return this.vehiculoService.getVehiculoByConductor(user.uid).pipe(
                        switchMap(vehiculos => {
                            if (vehiculos && vehiculos.length > 0 && vehiculos[0].id) {
                                return this.carreraService.getCarrerasAsignadasAVehiculo(vehiculos[0].id!);
                            } else {
                                return of([]);
                            }
                        })
                    );
                } else {
                    // If logged out, return empty list
                    return of([]);
                }
            })
        ).subscribe(aprobaciones => {
            // Sort the list (same logic as before)
            const sorted = aprobaciones.sort((a, b) => {
                const priority: { [key: string]: number } = {
                    'En ruta': 1,
                    'Finalizada': 2
                };
                const priorityA = priority[a.estado as string] || 99;
                const priorityB = priority[b.estado as string] || 99;
                return priorityA - priorityB;
            });

            this.aprobacionesSubject.next(sorted);
            this.checkNewApprovals(sorted);
        });
    }

    private checkNewApprovals(aprobaciones: CreateCarreraModel[]) {
        const activeRace = aprobaciones.find(c => c.estado === 'En ruta');

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
}
