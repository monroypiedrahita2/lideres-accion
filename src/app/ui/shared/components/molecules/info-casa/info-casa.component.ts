import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CasaApoyoModel } from '../../../../../models/casa-apoyo/casa-apoyo.model';

@Component({
    selector: 'lida-info-casa',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './info-casa.component.html',
    styleUrls: ['./info-casa.component.scss']
})
export class InfoCasaComponent {
    @Input({ required: true }) casa!: CasaApoyoModel;
    @Input() showActions: boolean = true;
    @Output() deleteClicked = new EventEmitter<void>();
    @Output() assignResponsableClicked = new EventEmitter<void>();

    onDelete() {
        this.deleteClicked.emit();
    }

    onAssignResponsable() {
        this.assignResponsableClicked.emit();
    }
}
