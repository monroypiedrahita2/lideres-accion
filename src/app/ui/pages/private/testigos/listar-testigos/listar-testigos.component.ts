import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MgPaginatorComponent, PageEvent } from '../../../../shared/components/modules/paginator/paginator.component';
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
        MgPaginatorComponent
    ],
    templateUrl: './listar-testigos.component.html',
})
export class ListarTestigosComponent implements OnInit {
    testigos: BaseModel<TestigoModel>[] = [];
    paginatedTestigos: BaseModel<TestigoModel>[] = [];
    pageSize: number = 5;
    pageIndex: number = 0;
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
                this.updatePagination();
            },
        });
    }

    edit(referido: BaseModel<TestigoModel>) {
        this.router.navigate(['private/editar-referido', referido.id]);
    }

    openModal(data: { name: string; id: string }) {
        this.showModal = true;
        this.dataModal = data;
        this.referidoToDelete = this.testigos.find(t => t.id === data.id) || null;
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

    onWhatsApp(celular: string) {
        if (celular) {
            window.open(`https://wa.me/57${celular}`, '_blank');
        }
    }

    onCall(celular: string) {
        if (celular) {
            window.open(`tel:${celular}`, '_self');
        }
    }

    onClean(referido: BaseModel<TestigoModel>) {
        if (!referido.id) return;
        const testigo = { ...referido };
        testigo.data.uidLider = '';
        this.testigoService.updateTestigo(referido.id, testigo).then(() => {
            this.toast.success('Asignación eliminada correctamente');
            this.getTestigos();
        }).catch(() => {
            this.toast.error('Error al eliminar la asignación');
        });
    }

}
