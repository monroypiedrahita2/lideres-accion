import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CasaApoyoModel } from '../../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../../models/base/base.model';

@Component({
    selector: 'app-card-casa-apoyo',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './card-casa-apoyo.component.html',
    styleUrls: ['./card-casa-apoyo.component.scss']
})
export class CardCasaApoyoComponent {
    @Input() casa!: BaseModel<CasaApoyoModel> | any;
    @Input() showActions: boolean = true;
    @Input() showAssign: boolean = true;
    @Input() showUnassign: boolean = true;
    @Output() onAsignar = new EventEmitter<BaseModel<CasaApoyoModel>>();
    @Output() onDesasignar = new EventEmitter<BaseModel<CasaApoyoModel>>();

    asignar() {
        this.onAsignar.emit(this.casa);
    }

    desasignar() {
        this.onDesasignar.emit(this.casa);
    }
}
