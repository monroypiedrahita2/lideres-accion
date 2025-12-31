import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { PersonInfoComponent } from '../../../../shared/components/cards/person-info/person-info.component';
import { TestigoService } from '../../../../shared/services/testigo/testigo.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { TestigoModel } from '../../../../../models/testigo/testigo.model';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-listar-testigos',
    standalone: true,
    imports: [
        CommonModule,
        TitleComponent,
        PersonInfoComponent,
    ],
    templateUrl: './listar-testigos.component.html',
})
export class ListarTestigosComponent implements OnInit {
    testigos: BaseModel<TestigoModel>[] = [];
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    showModal: boolean = false;
    dataModal: { name: string; id: string } = { name: '', id: '' };
    referidoToDelete: BaseModel<TestigoModel> | null = null;

    constructor(
        private readonly testigoService: TestigoService,
        private readonly router: Router,
        private readonly toast: ToastrService
    ) { }

    ngOnInit(): void {
        this.getTestigos();
    }

    getTestigos() {
        this.testigoService.getAllTestigos().subscribe({
            next: (res: BaseModel<TestigoModel>[]) => {
                this.testigos = res;
            },
        });
    }

    edit(referido: BaseModel<TestigoModel>) {
        this.router.navigate(['private/editar-referido', referido.id]);
    }

    openModal(data: { name: string; id: string }) {
        this.showModal = true;
        this.dataModal = data;
        // Find the referido to delete based on ID since the modal only passes ID and name
        this.referidoToDelete = this.testigos.find(t => t.id === data.id) || null;
    }


}
