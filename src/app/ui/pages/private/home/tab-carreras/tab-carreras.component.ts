import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MisCarrerasComponent } from './mis-carreras/mis-carreras.component';
import { BuscarCarreraComponent } from './buscar-carrera/buscar-carrera.component';

@Component({
    selector: 'app-tab-carreras',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MisCarrerasComponent,
        BuscarCarreraComponent
    ],
    templateUrl: './tab-carreras.component.html',
    styleUrls: ['./tab-carreras.component.scss']
})
export class TabCarrerasComponent {
    constructor() { }
}
