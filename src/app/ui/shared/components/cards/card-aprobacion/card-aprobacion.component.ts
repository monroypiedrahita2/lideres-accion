import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerComponent } from '../../modules/spinner/spinner.component';

import { UserPhotoComponent } from '../../atoms/user-photo/user-photo.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { IconWhatsappComponent } from '../../atoms/icon-whatsapp/icon-whatsapp.component';

@Component({
    selector: 'app-card-aprobacion',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, SpinnerComponent, UserPhotoComponent, IconButtonComponent, IconWhatsappComponent],
    templateUrl: './card-aprobacion.component.html',
    styleUrls: ['./card-aprobacion.component.scss']
})
export class CardAprobacionComponent {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() date: string = '';
    @Input() status: string = '';
    @Input() phoneNumber: string = '';
    @Input() photoUrl: string | null | undefined;


    @Input() checked: boolean = false;
    @Input() showAssignAction: boolean = false;
    @Input() showAddWitnessAction: boolean = false;
    @Input() isLoading: boolean = false;
    @Output() checkedChange = new EventEmitter<boolean>();
    @Output() addWitnessAction = new EventEmitter<void>();

    onCheckboxChange(event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.checkedChange.emit(isChecked);
    }

    getStatusClasses(): string {
        if (!this.status) return 'bg-gray-100 text-gray-800';
        const statusLower = this.status.toLowerCase();

        switch (statusLower) {
            case 'rojo':
                return 'bg-red-100 text-red-800';
            case 'azul':
                return 'bg-blue-100 text-blue-800';
            case 'verde':
                return 'bg-green-100 text-green-800';
            case 'negro':
                return 'bg-gray-900 text-white';
            case 'blanco':
                return 'bg-white text-gray-800 border border-gray-200';
            case 'gris':
            case 'plata':
                return 'bg-gray-100 text-gray-800';
            case 'amarillo':
                return 'bg-yellow-100 text-yellow-800';
            case 'naranja':
                return 'bg-orange-100 text-orange-800';
            case 'café':
            case 'cafe':
            case 'marrón':
            case 'marron':
                return 'bg-amber-800 text-white';
            case 'morado':
                return 'bg-purple-100 text-purple-800';
            case 'rosa':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-blue-100 text-blue-800'; // Default fallback
        }
    }
}
