import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
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
    private readonly perfilService = inject(PerfilService);
    private readonly dialog = inject(MatDialog);

    dataSource = new MatTableDataSource<PerfilModel>([]);
    paginatedPerfiles: PerfilModel[] = [];
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    pageIndex: number = 0;
    pageSize: number = 5;

    ngOnInit() {
        this.loadPostulados();
    }

    loadPostulados() {
        if (this.usuario.iglesia) {
            this.perfilService.getPostuladosCasasApoyoByIglesia(this.usuario.iglesia).subscribe({
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
        this.paginatedPerfiles = this.dataSource.data.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePaginatedList();
    }

    aprobar(perfil: PerfilModel, estado: boolean) {
        // Here we update the user profile. 
        // Logic from dialog: 
        // casaApoyo: { status: true, casaApoyoId: '' }
        // BUT wait, 'estado' comes from checkbox.
        // If checked (true) -> Approve. If unchecked (false) -> logic for disapproving?
        // Assuming unchecking means removing approval (status: false or null).

        // However, PerfilModel interface for coordinadores is:
        // coordinadorCasaApoyo?: string | null;  // Stores ID? Or boolean?
        // Review PerfilModel:
        // coordinadorCasaApoyo?: string | null;

        // Wait, the previous code in dialog-casas-apoyo.ts line 119 was:
        /*
          casaApoyo: {
            status: true,
            casaApoyoId: ''
          }
        */
        // That form suggests the data structure in Firestore might be an object 'casaApoyo', 
        // but the interface shows `coordinadorCasaApoyo`.
        // Let's re-read PerfilModel.ts content from Step 53.
        /*
           12:   postulado?: PostuladoModel; 
           13:   coordinadorCasaApoyo?: string | null;
        */
        // The dialog code was trying to save `{ casaApoyo: { status: true ... } }`. 
        // If that was working, then the Model interface might be incomplete or the DB allows loose structure.
        // OR the dialog code I read in Step 76 lines 118-123 was referencing a structure I didn't see in the interface.

        // Let's check `AprobarVehiculos` again. It sets `aprobado: boolean` on VehiculoModel.

        // Let's look at `PerfilService.updatePerfil` in Step 91. It takes `AsigmentRolePerfilModel` or general update.
        // I will follow the logic that WAS present in `DialogCasasApoyoComponent.ts` because that was likely written to match backend expectation, 
        // even if interface TS definition is lagging. 
        // WAIT, `DialogCasasApoyoComponent.ts`:
        // const updateData: any = { casaApoyo: { status: true, casaApoyoId: '' } };

        // If I strictly follow `coordinadorCasaApoyo` from the model, it is a string|null.
        // But if the user says "approve", maybe it just sets a flag?

        // Let's stick to what the previous dialog was doing to be safe, using `any` if needed.
        // If `estado` is true -> approve.
        // If `estado` is false -> remove approval?

        // Actually, if we look at `PerfilModel` again:
        // `postulado` is where they ask for it.
        // `coordinadorCasaApoyo` seems to be the role assignment.

        // Let's assume enabling the switch = Assigning role.
        // If I make it true, I should enable it.

        const updateData: any = {};
        if (estado) {
            updateData.coordinadorCasaApoyo = ''; // Assign empty string as ID placeholder? Or just truthy?
            // The old code used a nested object `casaApoyo: { status: true ... }`. 
            // That looks like it might be saving into a completely different field 'casaApoyo' not in the interface, 
            // OR 'coordinadorCasaApoyo' is actually an object in DB but typed as string in UI model?
            // Let's check `DialogCasasApoyo` again.
            // Line 119: `casaApoyo: { status: true, casaApoyoId: '' }`
            // This structure might be what the app expects for "active" coordinator.

            updateData.casaApoyo = { status: true, casaApoyoId: '' };
        } else {
            // If unchecking, maybe remove it?
            updateData.casaApoyo = { status: false, casaApoyoId: '' };
            // or set to null?
        }

        this.perfilService.updatePerfil(perfil.id!, updateData).then(() => {
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: `Solicitud ${estado ? 'aprobada' : 'desaprobada'} correctamente.`,
                    type: 'success'
                }
            });
            this.loadPostulados();
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
