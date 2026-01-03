import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogContent,
    MatDialogClose,
} from '@angular/material/dialog';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { BaseModel } from '../../../../models/base/base.model';
import { TitleComponent } from '../../components/atoms/title/title.component';

@Component({
    selector: 'app-dialog-casa-apoyo-detalles',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogClose,
        ButtonComponent,
        MatIconModule,
        TitleComponent
    ],
    templateUrl: './dialog-casa-apoyo-detalles.component.html',
    styleUrls: ['./dialog-casa-apoyo-detalles.component.scss']
})
export class DialogCasaApoyoDetallesComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogCasaApoyoDetallesComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BaseModel<CasaApoyoModel>
    ) { }

    onClose(): void {
        this.dialogRef.close();
    }
}
