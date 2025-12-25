import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { InfoCasaComponent } from '../../../shared/components/molecules/info-casa/info-casa.component';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { DialogAsignarResponsableComponent } from '../../../shared/dialogs/dialog-asignar-responsable/dialog-asignar-responsable.component';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';

@Component({
    selector: 'app-listar-casas-apoyo',
    standalone: true,
    imports: [
        CommonModule,
        InfoCasaComponent
    ],
    templateUrl: './listar-casas-apoyo.component.html',
    styleUrls: ['./listar-casas-apoyo.component.scss']
})
export class ListarCasasApoyoComponent implements OnInit {
    casas: BaseModel<CasaApoyoModel>[] = [];
    loading: boolean = true;

    constructor(
        private casaApoyoService: CasaApoyoService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadCasas();
    }

    loadCasas() {
        this.loading = true;
        this.casaApoyoService.getCasasApoyo().subscribe({
            next: (casas) => {
                this.casas = casas;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading casas:', error);
                this.loading = false;
            }
        });
    }

    onDeleteCasa(casa: BaseModel<CasaApoyoModel>) {
        const dialogData = {
            title: 'Confirmar eliminación',
            message: `¿Está seguro que desea eliminar la casa de apoyo ubicada en ${casa.data.direccion}?`,
            bottons: 'Eliminar',
            type: 'warning' as const
        };

        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            width: '400px',
            data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true && casa.id) {
                this.casaApoyoService.deleteCasaApoyo(casa.id!).then(() => {
                    this.showSuccessNotification('Casa de apoyo eliminada exitosamente');
                    this.loadCasas();
                }).catch(error => {
                    console.error('Error deleting casa:', error);
                    this.showErrorNotification('Error al eliminar la casa de apoyo');
                });
            }
        });
    }

    onAssignResponsable(casa: BaseModel<CasaApoyoModel>) {
        const dialogRef = this.dialog.open(DialogAsignarResponsableComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: { casaId: casa.id }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && casa.id) {
                this.casaApoyoService.assignResponsable(
                    casa.id!,
                    result.id,
                    `${result.nombres} ${result.apellidos}`,
                    result.documento
                ).then(() => {
                    this.showSuccessNotification('Responsable asignado exitosamente');
                    this.loadCasas();
                }).catch(error => {
                    console.error('Error assigning responsable:', error);
                    this.showErrorNotification('Error al asignar responsable');
                });
            }
        });
    }

    private showSuccessNotification(message: string) {
        const dialogData = {
            title: 'Éxito',
            message: message,
            bottons: 'Aceptar',
            type: 'success' as const
        };

        this.dialog.open(DialogNotificationComponent, {
            width: '400px',
            data: dialogData
        });
    }

    private showErrorNotification(message: string) {
        const dialogData = {
            title: 'Error',
            message: message,
            bottons: 'Aceptar',
            type: 'error' as const
        };

        this.dialog.open(DialogNotificationComponent, {
            width: '400px',
            data: dialogData
        });
    }
}
