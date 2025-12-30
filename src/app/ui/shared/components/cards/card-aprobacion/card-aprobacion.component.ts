import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-card-aprobacion',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, ],
    templateUrl: './card-aprobacion.component.html',
    styleUrls: ['./card-aprobacion.component.scss']
})
export class CardAprobacionComponent {          
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() date: string = '';
    @Input() status: string = '';


    @Input() checked: boolean = false;
    @Output() checkedChange = new EventEmitter<boolean>();

    onCheckboxChange(event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.checked = isChecked;
        this.checkedChange.emit(isChecked);
    }
}
