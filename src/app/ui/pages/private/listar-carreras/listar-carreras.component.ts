import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MgPaginatorComponent, PageEvent } from '../../../shared/components/modules/paginator/paginator.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CardInfoComponent } from '../../../shared/components/cards/card-info/card-info.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { ToastrService } from 'ngx-toastr';
import { SpinnerComponent } from '../../../shared/components/modules/spinner/spinner.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CarreraService } from '../../../shared/services/carrera/carrera.service';
import { CreateCarreraModel } from '../../../../models/carrera/carrera.model';

@Component({
    selector: 'app-listar-carreras', // Updated selector to match file name better, though not strictly necessary
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MgPaginatorComponent,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        InputTextComponent,
        ReactiveFormsModule,
        CardInfoComponent,
        TitleComponent,
        SpinnerComponent,
        MatDialogModule
    ],
    templateUrl: './listar-carreras.component.html',
    styleUrls: ['./listar-carreras.component.scss']
})
export class ListarCarrerasComponent implements AfterViewInit {
    dataSource = new MatTableDataSource<CreateCarreraModel>([]);
    paginatedCarreras: CreateCarreraModel[] = [];
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    searchControl = new FormControl('');

    // Pagination state
    pageIndex: number = 0;
    pageSize: number = 5;
    pageSizeOptions: number[] = [5, 10, 25, 100];

    displayedColumns: string[] = ['solicitante', 'origen', 'destino', 'conductor', 'placa', 'estado'];

    // Modal state
    showSpinner: boolean = false;


    constructor(
        private carreraService: CarreraService,
        private toast: ToastrService,
    ) {
        this.cargarCarreras();
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.applyFilter(value || '');
        });
    }

    cargarCarreras() {
            this.carreraService.getCarrerasEnRuta().subscribe(data => {
                this.dataSource.data = data;
                this.updatePaginatedList();
                if (this.searchControl.value) {
                    this.applyFilter(this.searchControl.value);
                }
            });
    }

    ngAfterViewInit() {
    }

    applyFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data: CreateCarreraModel, filter: string) => {
            const solicitante = data.nombreVotante ? data.nombreVotante.toLowerCase() : '';
            const origen = data.lugarRecogida ? data.lugarRecogida.toLowerCase() : '';
            const destino = data.puestoVotacionIr && data.puestoVotacionIr.nombre ? data.puestoVotacionIr.nombre.toLowerCase() : '';
            const conductor = data.datosConductorAprobado && data.datosConductorAprobado.nombre ? data.datosConductorAprobado.nombre.toLowerCase() : '';
            const searchStr = filter.trim().toLowerCase();

            return solicitante.includes(searchStr) || origen.includes(searchStr) || destino.includes(searchStr) || conductor.includes(searchStr);
        };
        this.dataSource.filter = filterValue.trim().toLowerCase();

        this.pageIndex = 0; // Reset to first page on filter
        this.updatePaginatedList();
    }

    updatePaginatedList() {
        const startIndex = this.pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedCarreras = this.dataSource.filteredData.slice(startIndex, endIndex);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePaginatedList();
    }
}
