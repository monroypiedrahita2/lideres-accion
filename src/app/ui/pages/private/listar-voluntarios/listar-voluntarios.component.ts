import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CardInfoComponent } from '../../../shared/components/cards/card-info/card-info.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';

@Component({
    selector: 'app-listar-voluntarios',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule, // Keep for DataSource type usage if needed, though we don't use mat-table in template
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        InputTextComponent,
        ReactiveFormsModule,
        CardInfoComponent,
        TitleComponent
    ],
    templateUrl: './listar-voluntarios.component.html',
    styleUrls: ['./listar-voluntarios.component.scss']
})
export class ListarVoluntariosComponent implements AfterViewInit {
    dataSource = new MatTableDataSource<PerfilModel>([]);
    paginatedVoluntarios: PerfilModel[] = []; // Array to hold the current page's data
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    searchControl = new FormControl('');

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private perfilService: PerfilService) {
        this.cargarVoluntarios();
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.applyFilter(value || '');
        });
    }

    cargarVoluntarios() {
        if (this.usuario.iglesia) {
            this.perfilService.getPerfilesByIglesia(this.usuario.iglesia).subscribe(data => {
                this.dataSource.data = data.filter(perfil => perfil.rol !== 'Pastor');
                // Initialize paginated list after data load
                this.updatePaginatedList();

                // Re-apply filter if exists
                if (this.searchControl.value) {
                    this.applyFilter(this.searchControl.value);
                }
            });
        }
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;

        // Subscribe to paginator updates to refresh the list
        this.paginator.page.subscribe(() => {
            this.updatePaginatedList();
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data: PerfilModel, filter: string) => {
            const doc = data.documento ? data.documento.toString().toLowerCase() : '';
            const nombre = data.nombres ? data.nombres.toLowerCase() : '';
            const apellido = data.apellidos ? data.apellidos.toLowerCase() : '';
            const searchStr = filter.trim().toLowerCase();

            return doc.includes(searchStr) || nombre.includes(searchStr) || apellido.includes(searchStr);
        };
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.paginator) {
            this.paginator.firstPage();
        }
        this.updatePaginatedList();
    }

    updatePaginatedList() {
        if (!this.paginator) {
            // If paginator is not ready yet, just show the first chunk
            this.paginatedVoluntarios = this.dataSource.filteredData.slice(0, 5);
            return;
        }
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        const endIndex = startIndex + this.paginator.pageSize;
        this.paginatedVoluntarios = this.dataSource.filteredData.slice(startIndex, endIndex);
    }
}
