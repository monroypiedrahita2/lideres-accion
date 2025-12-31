import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { CardCasaApoyoComponent } from '../../../shared/components/cards/card-casa-apoyo/card-casa-apoyo.component';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../models/base/base.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatIconModule } from '@angular/material/icon';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';

@Component({
    selector: 'app-listar-casas-apoyo',
    standalone: true,
    imports: [CommonModule, CardCasaApoyoComponent, MatIconModule, TitleComponent],
    templateUrl: './listar-casas-apoyo.component.html',
    styleUrls: ['./listar-casas-apoyo.component.scss']
})
export class ListarCasasApoyoComponent implements OnInit {
    private readonly casaApoyoService = inject(CasaApoyoService);
    private readonly dialog = inject(MatDialog);
    casas: BaseModel<CasaApoyoModel>[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    ngOnInit() {
        this.loadCasas();
    }

    loadCasas() {
        // Fetch approved houses for the user's church
        if (this.usuario.iglesia) {
            this.casaApoyoService.getCasasApoyoAprobadasByIglesia(this.usuario.iglesia).subscribe({
                next: (data) => {
                    this.casas = data;
                },
                error: (err) => console.error(err)
            });
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
