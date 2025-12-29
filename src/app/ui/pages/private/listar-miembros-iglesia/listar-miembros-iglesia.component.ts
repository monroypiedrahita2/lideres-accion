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

@Component({
    selector: 'app-listar-miembros-iglesia',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        InputTextComponent,
        ReactiveFormsModule
    ],
    templateUrl: './listar-miembros-iglesia.component.html',
    styleUrls: ['./listar-miembros-iglesia.component.scss']
})
export class ListarMiembrosIglesiaComponent implements AfterViewInit {
    displayedColumns: string[] = ['documento', 'nombres', 'apellidos', 'celular', 'rol'];
    dataSource = new MatTableDataSource<PerfilModel>([]);
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    searchControl = new FormControl('');

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private perfilService: PerfilService) {
        this.cargarMiembros();
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.applyFilter(value || '');
        });
    }

    cargarMiembros() {
        if (this.usuario.iglesia) {
            this.perfilService.getPerfilesByIglesia(this.usuario.iglesia).subscribe(data => {
                this.dataSource.data = data;
                this.dataSource.paginator = this.paginator;
                // Re-apply filter if exists
                if (this.searchControl.value) {
                    this.applyFilter(this.searchControl.value);
                }
            });
        }
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
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

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}
