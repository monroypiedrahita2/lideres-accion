
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogModule,
} from '@angular/material/dialog';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { PerfilModel } from '../../../../../../models/perfil/perfil.model';
import { BaseModel } from '../../../../../../models/base/base.model';
import { TestigoAsociadoModel } from '../../../../../../models/testigo-asociado/testigo-asociado.model';
import { TestigoAsociadoService } from '../../../../../shared/services/testigo-asociado/testigo-asociado.service';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { InputTextComponent } from '../../../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../../../shared/components/atoms/title/title.component';

@Component({
    selector: 'app-dialog-gestion-testigos',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        ButtonComponent,
        InputTextComponent,
        TitleComponent
    ],
    templateUrl: './dialog-gestion-testigos.component.html',
})
export class DialogGestionTestigosComponent implements OnInit {
    form!: FormGroup;
    testigos$: Observable<BaseModel<TestigoAsociadoModel>[]>;
    loading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<DialogGestionTestigosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { coordinador: PerfilModel },
        private readonly fb: FormBuilder,
        private readonly testigoAsociadoService: TestigoAsociadoService,
        private readonly toast: ToastrService
    ) {
        // Initialize with empty observable, will be set in ngOnInit or constructor
        this.testigos$ = this.testigoAsociadoService.getTestigosByCoordinador(
            this.data.coordinador.id || ''
        );

        this.form = this.fb.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            celular: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.minLength(10),
                    Validators.maxLength(10),
                ],
            ],
        });
    }

    ngOnInit(): void {
    }

    async onSubmit() {
        if (this.form.invalid) return;

        this.loading = true;
        const rawValue = this.form.getRawValue();

        const newTestigo: BaseModel<TestigoAsociadoModel> = {
            data: {
                nombres: rawValue.nombres,
                apellidos: rawValue.apellidos,
                celular: rawValue.celular,
                puestoVotacion: 'Asignado por Admin', // Default or empty
                mesa: '0', // Default or empty
                coordinadorId: this.data.coordinador.id || '',
            },
            fechaCreacion: new Date().toISOString(),
            creadoPor: 'ADMIN', // Or current user ID, but distinguishing helps
        };

        try {
            await this.testigoAsociadoService.crearTestigoAsociado(newTestigo);
            this.toast.success('Testigo agregado correctamente');
            this.form.reset();
        } catch (error) {
            console.error(error);
            this.toast.error('Error al agregar testigo');
        } finally {
            this.loading = false;
        }
    }

    async deleteTestigo(id: string) {
        try {
            await this.testigoAsociadoService.deleteTestigoAsociado(id);
            this.toast.success('Testigo eliminado');
        } catch (error) {
            this.toast.error('Error al eliminar testigo');
        }
    }

    close() {
        this.dialogRef.close();
    }
}
