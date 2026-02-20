import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../models/base/base.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { CardCasaApoyoComponent } from '../../../shared/components/cards/card-casa-apoyo/card-casa-apoyo.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';

@Component({
    selector: 'app-inscribir-casas-apoyo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        InputTextComponent,
        CardCasaApoyoComponent,
        TitleComponent
    ],
    templateUrl: './inscribir-casas-apoyo.component.html',
})
export class InscribirCasasApoyoComponent {
    private readonly casaApoyoService = inject(CasaApoyoService);
    private readonly dialog = inject(MatDialog);
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    searchControl = new FormControl('', [Validators.required]);
    casas: BaseModel<CasaApoyoModel>[] = [];
    loading = false;
    hasSearched = false;

    search() {
        if (this.searchControl.invalid) return;

        this.loading = true;
        this.hasSearched = true;
        const direccion = this.searchControl.value!;

        this.casaApoyoService.getCasaApoyoByDireccion(direccion).subscribe({
            next: (data) => {
                this.casas = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.casas = [];
            }
        });
    }

    asignar(casa: BaseModel<CasaApoyoModel>) {
        // Check if already assigned based on responsible data, not just ID existence (since all docs have IDs)
        if (casa.data.responsableNombre) {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: casa.id === this.usuario.uid ? 'Esta casa ya está asignada a ti.' : 'Esta casa ya tiene un responsable asignado.',
                    type: casa.id === this.usuario.uid ? 'warning' : 'error'
                }
            });
            return;
        }

        this.casaApoyoService.assignResponsable(casa.id!, this.usuario.uid, `${this.usuario.nombre} ${this.usuario.apellido}`, this.usuario.cedula).then(async () => {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: 'Casa de apoyo asignada correctamente.',
                    type: 'success'
                }
            });
            this.search(); // Refresh list
        }).catch(err => {
            console.error(err);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: 'Ocurrió un error al asignar la casa.',
                    type: 'error'
                }
            });
        });
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
                // Pass empty strings/nulls to unassign
                this.casaApoyoService.assignResponsable(casa.id!, '', '', '').then(() => {
                    this.dialog.open(DialogNotificationComponent, {
                        data: {
                            title: 'Desasignado',
                            message: 'Casa desasignada correctamente.',
                            type: 'success'
                        }
                    });
                    this.search();
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
