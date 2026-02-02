import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'mg-icon-button',
    templateUrl: './icon-button.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterModule],
})
export class IconButtonComponent {
    @Input() icon!: string;
    @Input() customIcon?: string;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'bg-white' | 'info' = 'primary';
    @Input() disabled: boolean = false;
    @Input() link?: string;
    @Input() target: string = '_self';
    @Output() onClick = new EventEmitter<void>();

    handleClick() {
        if (this.disabled) return;
        this.onClick.emit();
    }
}
