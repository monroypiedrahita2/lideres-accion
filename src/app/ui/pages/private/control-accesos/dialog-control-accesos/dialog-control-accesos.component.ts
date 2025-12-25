import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogModule,
} from '@angular/material/dialog';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { LIST_ROLES } from '../../../../shared/const/Permisos/list-roles.const';
import { FormsModule } from '@angular/forms';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-dialog-control-accesos',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        ButtonComponent,
        TitleComponent,
        FormsModule,
    ],
    templateUrl: './dialog-control-accesos.component.html',
})
export class DialogControlAccesosComponent implements OnInit {
    roles = LIST_ROLES;
    selectedRole: string = '';

    constructor(
        public dialogRef: MatDialogRef<DialogControlAccesosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PerfilModel
    ) { }

    ngOnInit(): void {
        if (this.data.rol && this.data.rol !== 'Sin rol asignado') {
            const found = this.roles.find(r => r.value === this.data.rol);
            if (found) {
                this.selectedRole = found.value;
            }
        }
    }

    toggleRole(roleValue: string) {
        if (this.selectedRole === roleValue) {
            this.selectedRole = '';
        } else {
            this.selectedRole = roleValue;
        }
    }

    confirm() {
        this.dialogRef.close(this.selectedRole);
    }

    close() {
        this.dialogRef.close();
    }
}
