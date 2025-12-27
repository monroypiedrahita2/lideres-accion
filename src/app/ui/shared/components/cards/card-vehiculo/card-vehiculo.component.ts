import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';

@Component({
    selector: 'app-card-vehiculo',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './card-vehiculo.component.html',
    styleUrls: ['./card-vehiculo.component.scss']
})
export class CardVehiculoComponent {
    @Input() vehiculo!: VehiculoModel | any;
    @Input() showActions: boolean = true;
    @Output() onAsignar = new EventEmitter<VehiculoModel>();
    @Output() onDesasignar = new EventEmitter<VehiculoModel>();

    asignar() {
        this.onAsignar.emit(this.vehiculo);
    }

    desasignar() {
        this.onDesasignar.emit(this.vehiculo);
    }
}
