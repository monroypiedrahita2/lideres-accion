
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'mg-user-photo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-photo.component.html',
})
export class UserPhotoComponent {
    @Input() photoUrl: string | null | undefined = null;
    @Input() sizeClass: string = 'w-28 h-28';
    @Input() iconSizeClass: string = 'w-14 h-14';
    @Input() showDeleteAndEditAction: boolean = false;
    @Output() deleteAction = new EventEmitter<void>();

    onDelete(): void {
        this.deleteAction.emit();
    }
}
