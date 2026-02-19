import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
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
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        InputSelectComponent, // Changed from InputTextComponent
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
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
    searchControl = new FormControl('');
    destinosOptions: SelectOptionModel<string>[] = [];

    displayedColumns: string[] = ['solicitante', 'origen', 'destino', 'conductor', 'placa', 'telefono', 'estado'];

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

            // Extract unique destinations
            const destinos = [...new Set(data.map(c => c.puestoVotacionIr.nombre))];
            this.destinosOptions = destinos.map(d => ({ label: d, value: d }));

            if (this.searchControl.value) {
                this.applyFilter(this.searchControl.value);
            }
        });
    }

    ngAfterViewInit() {
    }

    applyFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data: CreateCarreraModel, filter: string) => {
            // Strict filtering by destination if it's selected
            const destino = data.puestoVotacionIr && data.puestoVotacionIr.nombre ? data.puestoVotacionIr.nombre.toLowerCase() : '';
            const searchStr = filter.trim().toLowerCase();
            return destino.includes(searchStr);
        };
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
