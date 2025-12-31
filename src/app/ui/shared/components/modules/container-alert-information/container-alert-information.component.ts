import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-container-alert-information',
    templateUrl: './container-alert-information.component.html',
    imports: [CommonModule],
    standalone: true
})
export class ContainerAlertInformationComponent implements OnInit {

    @Input() type: 'success' | 'error' | 'info' | 'warning' = 'warning';
    @Input() title: string = '';

    constructor() { }

    ngOnInit(): void {
    }

    get containerClasses(): string {
        switch (this.type) {
            case 'success':
                return 'bg-green-100 border-green-500 text-green-700';
            case 'error':
                return 'bg-red-100 border-red-500 text-red-700';
            case 'info':
                return 'bg-blue-100 border-blue-500 text-blue-700';
            case 'warning':
            default:
                return 'bg-yellow-100 border-yellow-500 text-yellow-700';
        }
    }

    get titleClasses(): string {
        switch (this.type) {
            case 'success':
                return 'text-green-900';
            case 'error':
                return 'text-red-900';
            case 'info':
                return 'text-blue-900';
            case 'warning':
            default:
                return 'text-yellow-900';
        }
    }

    get textClasses(): string {
        switch (this.type) {
            case 'success':
                return 'text-green-700';
            case 'error':
                return 'text-red-700';
            case 'info':
                return 'text-blue-700';
            case 'warning':
            default:
                return 'text-yellow-700';
        }
    }

}
