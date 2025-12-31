import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
    selector: 'app-aprobar-casas-apoyo',
    standalone: true,
    imports: [CommonModule, MatIconModule, TitleComponent, MgPaginatorComponent, CardAprobacionComponent],
    templateUrl: './aprobar-casas-apoyo.component.html',
    styleUrls: ['./aprobar-casas-apoyo.component.scss']
})
export class AprobarCasasApoyoComponent implements OnInit {
    private readonly casaApoyoService = inject(CasaApoyoService);
    private readonly dialog = inject(MatDialog);

    dataSource = new MatTableDataSource<BaseModel<CasaApoyoModel>>([]);
    paginatedCasas: BaseModel<CasaApoyoModel>[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    pageIndex: number = 0;
    pageSize: number = 5;

    ngOnInit() {
        this.loadCasas();
    }

    loadCasas() {
        if (this.usuario.iglesia) {
            this.casaApoyoService.getCasasApoyoByIglesia(this.usuario.iglesia).subscribe({
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

    aprobar(casa: BaseModel<CasaApoyoModel>, estado: boolean) {
        // Update the approval status of the support house
        const updateData: CasaApoyoModel = {
            ...casa.data,
            aprobado: estado
        };

        this.casaApoyoService.updateCasaApoyo(casa.id!, updateData).then(() => {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: `Casa ${estado ? 'aprobada' : 'desaprobada'} correctamente.`,
                    type: 'success'
                }
            });
            // No need to reload manually if subscription updates automatically, but good to have if it's one-shot.
            // Since we use collectionData, it should be real-time, but let's leave load if needed.
            // Actually collectionData is observable, so local data should update automatically.
        }).catch(err => {
            console.error(err);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: 'Ocurrió un error al actualizar.',
                    type: 'error'
                }
            });
        });
    }
}
