import { Component, inject, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { CardCasaApoyoComponent } from '../../../shared/components/cards/card-casa-apoyo/card-casa-apoyo.component';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../models/base/base.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';

@Component({
    selector: 'app-listar-casas-apoyo',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, CardCasaApoyoComponent, MatIconModule, TitleComponent],
    templateUrl: './listar-casas-apoyo.component.html',
    styleUrls: ['./listar-casas-apoyo.component.scss']
})
export class ListarCasasApoyoComponent implements OnInit {
    private readonly casaApoyoService = inject(CasaApoyoService);
    private readonly vehiculoService = inject(VehiculoService);
    private readonly dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);
    casas: BaseModel<CasaApoyoModel>[] = [];
    vehiculosDisponibles: VehiculoModel[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    ngOnInit() {
        this.loadCasas();
        this.loadVehiculosDisponibles();
    }

    loadCasas() {
        // Fetch approved houses for the user's church
        if (this.usuario.iglesia) {
            this.casaApoyoService.getCasasApoyoAprobadasByIglesia(this.usuario.iglesia)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (data) => {
                    this.casas = data;
                },
                error: (err) => console.error(err)
            });
        }
    }

    loadVehiculosDisponibles() {
        // Load available vehicles (approved and without casa de apoyo) once
        if (this.usuario.iglesia) {
            this.vehiculoService.getVehiculosAprobadosSinCasaByIglesia(this.usuario.iglesia)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (data) => {
                    this.vehiculosDisponibles = data;
                },
                error: (err) => console.error('Error loading available vehicles:', err)
            });
        }
    }

    onVehiculoChanged(event?: { vehiculo: VehiculoModel, action: 'asociar' | 'desasociar' }) {
        // Update available vehicles list locally without making a new API call
        if (event) {
            if (event.action === 'asociar') {
                // Remove vehicle from available list when assigned
                this.vehiculosDisponibles = this.vehiculosDisponibles.filter(v => v.id !== event.vehiculo.id);
            } else if (event.action === 'desasociar') {
                // Add vehicle back to available list when unassigned
                this.vehiculosDisponibles = [...this.vehiculosDisponibles, event.vehiculo];
            }
        } else {
            // Fallback: reload if no event data provided
            this.loadVehiculosDisponibles();
        }
    }

    desasignar(casa: BaseModel<CasaApoyoModel>) {
        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: {
                title: 'Confirmación',
                message: `¿Estás seguro de desasignar la casa en ${casa.data.direccion}?`,
                type: 'warning',
                bottons: 'two',
                actionText: 'Desasignar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.casaApoyoService.assignResponsable(casa.id!, '', '', '').then(() => {
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Desasignado',
                            message: 'Casa desasignada correctamente.',
                            type: 'success'
                        }
                    });
                }).catch(err => {
                    console.error(err);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Error',
                            message: 'Ocurrió un error al desasignar la casa.',
                            type: 'error'
                        }
                    });
                });
            }
        });
    }
}
