import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { CardVehiculoComponent } from '../../../shared/components/cards/card-vehiculo/card-vehiculo.component';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from "../../../shared/components/atoms/title/title.component";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-listar-vehiculos',
    standalone: true,
    imports: [CommonModule, CardVehiculoComponent, MatIconModule, TitleComponent, MatPaginatorModule],
    templateUrl: './listar-vehiculos.component.html',
    styleUrls: ['./listar-vehiculos.component.scss']
})
export class ListarVehiculosComponent implements OnInit, AfterViewInit {
    private readonly vehiculoService = inject(VehiculoService);
    private readonly dialog = inject(MatDialog);

    dataSource = new MatTableDataSource<VehiculoModel>([]);
    paginatedVehiculos: VehiculoModel[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnInit() {
        this.loadVehiculos();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.paginator.page.subscribe(() => {
            this.updatePaginatedList();
        });
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
        if (!this.paginator) {
            this.paginatedVehiculos = this.dataSource.data.slice(0, 5); // Default page size
            return;
        }
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        const endIndex = startIndex + this.paginator.pageSize;
        this.paginatedVehiculos = this.dataSource.data.slice(startIndex, endIndex);
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
}
