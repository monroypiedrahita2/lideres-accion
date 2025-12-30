import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';

import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { Action } from 'rxjs/internal/scheduler/Action';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from "../../../shared/components/atoms/title/title.component";
import { MatTableDataSource } from '@angular/material/table';
import { CardAprobacionComponent } from '../../../shared/components/cards/card-aprobacion/card-aprobacion.component';
import { MgPaginatorComponent, PageEvent } from '../../../shared/components/modules/paginator/paginator.component';

@Component({
    selector: 'app-listar-vehiculos',
    standalone: true,
    imports: [CommonModule, MatIconModule, TitleComponent, MgPaginatorComponent, CardAprobacionComponent],
    templateUrl: './listar-vehiculos.component.html',
    styleUrls: ['./listar-vehiculos.component.scss']
})
export class ListarVehiculosComponent implements OnInit, AfterViewInit {
    private readonly vehiculoService = inject(VehiculoService);
    private readonly dialog = inject(MatDialog);

    dataSource = new MatTableDataSource<VehiculoModel>([]);
    paginatedVehiculos: VehiculoModel[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    pageIndex: number = 0;
    pageSize: number = 5;

    ngOnInit() {
        this.loadVehiculos();
    }

    ngAfterViewInit() {

    }

    loadVehiculos() {
        if (this.usuario.iglesia) {
            this.vehiculoService.getVehiculosByIglesia(this.usuario.iglesia).subscribe({
                next: (data) => {
                    this.dataSource.data = data;
                    this.updatePaginatedList();
                },
                error: (err) => console.error(err)
            });
        }
    }

    updatePaginatedList() {
        const startIndex = this.pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedVehiculos = this.dataSource.data.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePaginatedList();
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

    aprobarVehiculo(vehiculo: VehiculoModel, estado: boolean) {
        this.vehiculoService.updateVehiculo(vehiculo.id!, { ...vehiculo, aprobado: estado }).then(() => {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: `Vehículo ${estado ? 'aprobado' : 'desaprobado'} correctamente.`,
                    type: 'success'
                }
            });
            this.loadVehiculos();
        }).catch(err => {
            console.error(err);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: 'Ocurrió un error al actualizar el estado del vehículo.',
                    type: 'error'
                }
            });
        });
    }
}
