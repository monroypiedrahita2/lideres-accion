import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InputTextComponent } from '../../../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../../../shared/components/atoms/title/title.component';

@Component({
    selector: 'app-dialog-asignar-puesto-mesa',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        InputTextComponent,
        ButtonComponent,
        TitleComponent
    ],
    templateUrl: './dialog-asignar-puesto-mesa.component.html',
    styleUrls: ['./dialog-asignar-puesto-mesa.component.scss']
})
export class DialogAsignarPuestoMesaComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DialogAsignarPuestoMesaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.fb.group({
            puestodevotacion: ['', [Validators.required]],
            mesadevotacion: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern("^[0-9]*$")]]
        });
    }

    save() {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    close() {
        this.dialogRef.close();
    }
}
