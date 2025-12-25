import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { ReferidoService } from '../../services/referido/referido.service';
import { BaseModel } from '../../../../models/base/base.model';
import { ReferidoModel } from '../../../../models/referido/referido.model';

@Component({
    selector: 'app-dialog-asignar-responsable',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        InputTextComponent,
        ButtonComponent
    ],
    templateUrl: './dialog-asignar-responsable.component.html',
    styleUrls: ['./dialog-asignar-responsable.component.scss']
})
export class DialogAsignarResponsableComponent implements OnInit {
    searchForm: FormGroup;
    searching: boolean = false;
    searched: boolean = false;
    referido: BaseModel<ReferidoModel> | null = null;
    notFound: boolean = false;

    constructor(
        private fb: FormBuilder,
        private referidoService: ReferidoService,
        public dialogRef: MatDialogRef<DialogAsignarResponsableComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaId: string }
    ) {
        this.searchForm = this.fb.group({
            cedula: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
        });
    }

    ngOnInit(): void { }

    searchByCedula() {
        if (this.searchForm.invalid) {
            this.searchForm.markAllAsTouched();
            return;
        }

        const cedula = this.searchForm.get('cedula')?.value;
        this.searching = true;
        this.searched = false;
        this.notFound = false;
        this.referido = null;

        this.referidoService.getReferidoByDocument(cedula).then(
            (result) => {
                this.searching = false;
                this.searched = true;
                if (result) {
                    this.referido = { id: cedula, ...result } as BaseModel<ReferidoModel>;
                    this.notFound = false;
                } else {
                    this.notFound = true;
                }
            }
        ).catch(error => {
            console.error('Error searching referido:', error);
            this.searching = false;
            this.searched = true;
            this.notFound = true;
        });
    }

    assignResponsable() {
        if (this.referido) {
            this.dialogRef.close({
                id: this.referido.id,
                nombres: this.referido.data.nombres,
                apellidos: this.referido.data.apellidos,
                documento: this.referido.id
            });
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
