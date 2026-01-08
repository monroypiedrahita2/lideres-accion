import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InputTextComponent } from '../../../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../../../shared/components/atoms/title/title.component';
import { PuestoVotacionService } from '../../../../../shared/services/puesto-votacion/puesto-votacion.service';
import { InputSelectComponent, SelectOption } from '../../../../../shared/components/atoms/input-select/input-select.component';

@Component({
    selector: 'app-dialog-asignar-puesto-mesa',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        InputTextComponent,
        ButtonComponent,
        TitleComponent,
        InputSelectComponent
    ],
    templateUrl: './dialog-asignar-puesto-mesa.component.html',
    styleUrls: ['./dialog-asignar-puesto-mesa.component.scss']
})
export class DialogAsignarPuestoMesaComponent {
    form: FormGroup;
    puestosOptions: SelectOption[] = [];

    maxMesas: number = 100;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DialogAsignarPuestoMesaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly puestoVotacionService: PuestoVotacionService
    ) {
        this.form = this.fb.group({
            puestodevotacion: ['', [Validators.required]],
            mesadevotacion: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern("^[0-9]*$")]]
        });

        if (this.data?.iglesiaId) {
            this.loadPuestos(this.data.iglesiaId);
        }

        this.form.get('puestodevotacion')?.valueChanges.subscribe((value) => {
            if (value && value.mesastotales) {
                this.maxMesas = value.mesastotales;
                const mesaControl = this.form.get('mesadevotacion');
                mesaControl?.setValidators([
                    Validators.required,
                    Validators.min(1),
                    Validators.max(this.maxMesas),
                    Validators.pattern("^[0-9]*$")
                ]);
                mesaControl?.updateValueAndValidity();
            }
        });
    }

    loadPuestos(iglesiaId: string) {
        this.puestoVotacionService.getPuestosByIglesia(iglesiaId).subscribe(puestos => {
            this.puestosOptions = puestos.map(p => ({
                label: p.data.nombre,
                value: { id: p.id, nombre: p.data.nombre, mesastotales: p.data.mesastotales }
            }));
        });
    }

    save() {
        if (this.form.valid) {
            const formValue = this.form.value;
            const selectedPuesto = formValue.puestodevotacion;

            const result = {
                puestodevotacion: selectedPuesto.nombre,
                puestoId: selectedPuesto.id,
                mesadevotacion: formValue.mesadevotacion
            };

            this.dialogRef.close(result);
        } else {
            this.form.markAllAsTouched();
        }
    }

    close() {
        this.dialogRef.close();
    }
}
