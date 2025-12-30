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
    pageSize: number = 10;
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
            const testigoData: TestigoModel = {
                nombre: perfil.nombres,
                apellido: perfil.apellidos,
                iglesiaId: perfil.iglesia || '',
                celular: perfil.celular || '',
                puestodevotacion: '',
                mesadevotacion: '',
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
    }

    isChecked(perfil: PerfilModel): boolean {
        return perfil.id ? this.existingTestigosIds.has(perfil.id) : false;
    }
}
