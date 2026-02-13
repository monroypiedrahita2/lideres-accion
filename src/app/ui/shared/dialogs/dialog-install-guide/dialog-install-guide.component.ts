import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dialog-install-guide',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule],
    templateUrl: './dialog-install-guide.component.html',
})
export class DialogInstallGuideComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogInstallGuideComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { platform: string }
    ) { }
}
