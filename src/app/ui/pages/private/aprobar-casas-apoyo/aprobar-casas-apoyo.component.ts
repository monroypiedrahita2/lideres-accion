import { Component, inject, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../models/base/base.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from "../../../shared/components/atoms/title/title.component";
import { MatTableDataSource } from '@angular/material/table';
import { CardAprobacionComponent } from '../../../shared/components/cards/card-aprobacion/card-aprobacion.component';
import { MgPaginatorComponent, PageEvent } from '../../../shared/components/modules/paginator/paginator.component';
import { DialogAsignarVehiculoComponent } from '../../../shared/dialogs/dialog-asignar-vehiculo/dialog-asignar-vehiculo.component';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { take } from 'rxjs';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-aprobar-casas-apoyo',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, TitleComponent, MgPaginatorComponent, CardAprobacionComponent],
    templateUrl: './aprobar-casas-apoyo.component.html',
    styleUrls: ['./aprobar-casas-apoyo.component.scss']
})
export class AprobarCasasApoyoComponent implements OnInit {
    private readonly casaApoyoService = inject(CasaApoyoService);
    private readonly dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);

    dataSource = new MatTableDataSource<BaseModel<CasaApoyoModel>>([]);
    paginatedCasas: BaseModel<CasaApoyoModel>[] = [];
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

    pageIndex: number = 0;
    pageSize: number = 5;

    ngOnInit() {
        this.loadCasas();
    }

    loadCasas() {
        if (this.usuario.iglesia) {
            this.casaApoyoService.getCasasApoyoByIglesia(this.usuario.iglesia)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
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
        this.paginatedCasas = this.dataSource.data.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePaginatedList();
    }

    private readonly vehiculoService = inject(VehiculoService);

    loadingItems = new Set<string>();

    aprobar(casa: BaseModel<CasaApoyoModel>, estado: boolean) {
        if (this.loadingItems.has(casa.id!)) return;

        const executeUpdate = () => {
            this.loadingItems.add(casa.id!);
            const updateData: CasaApoyoModel = {
                ...casa.data,
                aprobado: estado,
                aprobadoPor: estado ? this.usuario.email : null
            };

            this.casaApoyoService.updateCasaApoyo(casa.id!, updateData)
                .then(() => {
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Éxito',
                            message: `Casa ${estado ? 'aprobada' : 'desaprobada'} correctamente.`,
                            type: 'success'
                        }
                    });
                })
                .catch(err => {
                    console.error(err);
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Error',
                            message: 'Ocurrió un error al actualizar.',
                            type: 'error'
                        }
                    });
                })
                .finally(() => {
                    this.loadingItems.delete(casa.id!);
                });
        };

        if (!estado) {
            // Validar si tiene vehículos asociados antes de desaprobar
            this.vehiculoService.getVehiculosByCasaApoyo(casa.id!).pipe(take(1)).subscribe(vehiculos => {
                if (vehiculos && vehiculos.length > 0) {
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'No se puede desaprobar',
                            message: 'No se puede desaprobar la Casa de Apoyo hasta que quite los vehículos asociados.',
                            type: 'error'
                        }
                    }).afterClosed().subscribe(() => {
                        this.loadCasas(); // Revertir el check en la UI
                    });
                } else {
                    const dialogRef = this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Confirmación',
                            message: `¿Estás seguro de desaprobar esta Casa de Apoyo?`,
                            type: 'warning',
                            bottons: 'two',
                            actionText: 'Desaprobar'
                        }
                    });

                    dialogRef.afterClosed().subscribe(result => {
                        if (result) {
                            executeUpdate();
                        } else {
                            this.loadCasas();
                        }
                    });
                }
            });
        } else {
            executeUpdate();
        }
    }
    asignarVehiculos(casa: BaseModel<CasaApoyoModel>) {
        this.dialog.open(DialogAsignarVehiculoComponent, {
            data: {
                casaId: casa.id,
                iglesiaId: this.usuario.iglesia
            },
            width: '100%',
            maxWidth: '600px'
        }).afterClosed().subscribe(result => {
            if (result) {
                this.dialog.open(DialogNotificationComponent, {
                    data: {
                        title: 'Éxito',
                        message: 'Vehículos asignados correctamente.',
                        type: 'success'
                    }
                });
            }
        });
    }
}
