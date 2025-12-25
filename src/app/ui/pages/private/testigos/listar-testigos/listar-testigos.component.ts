import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { PersonInfoComponent } from '../../../../shared/components/modules/person-info/person-info.component';
import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ReferidoModel } from '../../../../../models/referido/referido.model';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmActionComponent } from '../../../../shared/components/modules/modal/confirm-action.component';

@Component({
    selector: 'app-listar-testigos',
    standalone: true,
    imports: [
        CommonModule,
        TitleComponent,
        PersonInfoComponent,
        ConfirmActionComponent
    ],
    templateUrl: './listar-testigos.component.html',
})
export class ListarTestigosComponent implements OnInit {
    testigos: BaseModel<ReferidoModel>[] = [];
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    showModal: boolean = false;
    dataModal: { name: string; id: string } = { name: '', id: '' };
    referidoToDelete: BaseModel<ReferidoModel> | null = null;

    constructor(
        private readonly referidoService: ReferidoService,
        private readonly router: Router,
        private readonly toast: ToastrService
    ) { }

    ngOnInit(): void {
        this.getTestigos();
    }

    getTestigos() {
        this.referidoService.getTestigos(this.usuario.iglesia!).subscribe({
            next: (res: BaseModel<ReferidoModel>[]) => {
                this.testigos = res;
            },
        });
    }

    edit(referido: BaseModel<ReferidoModel>) {
        this.router.navigate(['private/editar-referido', referido.id]);
    }

    openModal(data: { name: string; id: string }) {
        this.showModal = true;
        this.dataModal = data;
        // Find the referido to delete based on ID since the modal only passes ID and name
        this.referidoToDelete = this.testigos.find(t => t.id === data.id) || null;
    }

    async quitarTestigo(referido: BaseModel<ReferidoModel>) {
        if (!referido) return;

        const data: BaseModel<ReferidoModel> = {
            ...referido,
            data: {
                ...referido.data,
                testigo: {
                    ...referido.data.testigo,
                    quiereApoyar: false,
                },
            },
        };

        try {
            await this.referidoService.updateReferido(referido.id!, data);
            this.toast.success('Testigo removido correctamente');
            this.getTestigos(); // Refresh list
            this.showModal = false;
        } catch (error) {
            console.error(error);
            this.toast.error('Error al remover el testigo. Intente nuevamente.');
        }
    }
}
