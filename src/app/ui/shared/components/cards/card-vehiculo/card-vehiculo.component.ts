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


    openWhatsapp() {
        if (this.vehiculo?.celular) {
            window.open(`https://wa.me/57${this.vehiculo.celular}`, '_blank');
        }
    }

    call() {
        if (this.vehiculo?.celular) {
            window.open(`tel:${this.vehiculo.celular}`, '_self');
        }
    }
}
