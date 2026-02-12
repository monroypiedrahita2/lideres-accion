import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-dialog-testigos',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        CommonModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        ButtonComponent,
        RouterLink
    ],
    templateUrl: './dialog-testigos.component.html',
    styleUrls: ['./dialog-testigos.component.scss']
})
export class DialogTestigosComponent {
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');


    constructor(
        public dialogRef: MatDialogRef<DialogTestigosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        const isPrivileged = this.usuario.rol === 'Pastor' ||
            this.usuario.rol === 'Super usuario' ||
            this.usuario.rol === 'Coordinador de iglesia' ||
            this.usuario.administradorTestigos;

        if (!isPrivileged) {
            this.dialogRef.close();
            this.router.navigate(['/private/activar-testigo']);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
