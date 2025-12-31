import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { CardAprobacionComponent } from '../../../../shared/components/cards/card-aprobacion/card-aprobacion.component';
import { MgPaginatorComponent, PageEvent } from '../../../../shared/components/modules/paginator/paginator.component';
import { PerfilService } from '../../../../shared/services/perfil/perfil.service';
import { TestigoService } from '../../../../shared/services/testigo/testigo.service';
import { DialogNotificationComponent } from '../../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { TestigoModel } from '../../../../../models/testigo/testigo.model';
import { BaseModel } from '../../../../../models/base/base.model';
import { DialogAsignarPuestoMesaComponent } from './dialog-asignar-puesto-mesa/dialog-asignar-puesto-mesa.component';

@Component({
    selector: 'app-activar-testigo',
    standalone: true,
    imports: [
        CommonModule,
        TitleComponent,
        CardAprobacionComponent,
        MgPaginatorComponent
    ],
    templateUrl: './activar-testigo.component.html',
})
export class ActivarTestigoComponent implements OnInit {
    testigos: PerfilModel[] = [];
    paginatedTestigos: PerfilModel[] = [];
    existingTestigosIds: Set<string> = new Set();
    pageSize: number = 5;
    pageIndex: number = 0;

    constructor(
        private readonly perfilService: PerfilService,
        private readonly testigoService: TestigoService,
        private readonly dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.perfilService.getPostuladosTestigos().subscribe((perfiles) => {
            this.testigos = perfiles;
            this.updatePagination();
        });

        this.testigoService.getAllTestigos().subscribe((witnesses) => {
            this.existingTestigosIds = new Set(witnesses.map((w) => w.id!));
        });
    }

    updatePagination() {
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedTestigos = this.testigos.slice(start, end);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePagination();
    }

    async aprobarTestigo(perfil: PerfilModel, isChecked: boolean) {
        if (isChecked) {
            const dialogRef = this.dialog.open(DialogAsignarPuestoMesaComponent, {
                width: '400px',
                disableClose: true,
            });

            dialogRef.afterClosed().subscribe(async (result) => {
                if (result) {
                    const testigoData: TestigoModel = {
                        nombre: perfil.nombres,
                        apellido: perfil.apellidos,
                        iglesiaId: perfil.iglesia || '',
                        celular: perfil.celular || '',
                        puestodevotacion: result.puestodevotacion,
                        mesadevotacion: result.mesadevotacion,
                    };

                    const baseData: BaseModel<TestigoModel> = {
                        data: testigoData,
                        fechaCreacion: new Date().toISOString(),
                        creadoPor: 'system',
                    };

                    try {
                        if (perfil.id) {
                            await this.testigoService.crearTestigo(baseData, perfil.id);
                            this.existingTestigosIds.add(perfil.id);
                            this.dialog.open(DialogNotificationComponent, {
                                data: {
                                    title: 'Éxito',
                                    message: 'Testigo activado correctamente',
                                    bottons: 'Aceptar',
                                    type: 'success',
                                },
                            });
                        }
                    } catch (error) {
                        this.dialog.open(DialogNotificationComponent, {
                            data: {
                                title: 'Error',
                                message: 'Error al activar testigo',
                                bottons: 'Aceptar',
                                type: 'error',
                            },
                        });
                    }
                }
            });
        } else {
            const dialogRef = this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Confirmar',
                    message: '¿Está seguro que desea desasociar a este usuario del listado de testigos?',
                    bottons: 'two',
                    type: 'warning',
                },
            });

            dialogRef.afterClosed().subscribe(async (result) => {
                if (result) {
                    try {
                        if (perfil.id) {
                            await this.testigoService.deleteTestigo(perfil.id);
                            this.existingTestigosIds.delete(perfil.id);
                            this.dialog.open(DialogNotificationComponent, {
                                data: {
                                    title: 'Éxito',
                                    message: 'Testigo desasociado correctamente',
                                    bottons: 'Aceptar',
                                    type: 'success',
                                },
                            });
                        }
                    } catch (error) {
                        this.dialog.open(DialogNotificationComponent, {
                            data: {
                                title: 'Error',
                                message: 'Error al desasociar testigo',
                                bottons: 'Aceptar',
                                type: 'error',
                            },
                        });
                    }
                }
            });
        }
    }

    isChecked(perfil: PerfilModel): boolean {
        return perfil.id ? this.existingTestigosIds.has(perfil.id) : false;
    }
}
