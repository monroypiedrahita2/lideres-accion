
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-dialog-asignar-vehiculo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        InputTextComponent,
        ButtonComponent
    ],
    templateUrl: './dialog-asignar-vehiculo.component.html',
    styleUrls: ['./dialog-asignar-vehiculo.component.scss']
})
export class DialogAsignarVehiculoComponent implements OnInit {
    searchForm: FormGroup;
    searching: boolean = false;
    searched: boolean = false;
    vehiculo: VehiculoModel | null = null;
    notFound: boolean = false;

    constructor(
        private fb: FormBuilder,
        private vehiculoService: VehiculoService,
        public dialogRef: MatDialogRef<DialogAsignarVehiculoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaId: string }
    ) {
        this.searchForm = this.fb.group({
            placa: ['', [Validators.required]]
        });
    }

    ngOnInit(): void { }

    async searchByPlaca() {
        if (this.searchForm.invalid) {
            this.searchForm.markAllAsTouched();
            return;
        }

        const placa = this.searchForm.get('placa')?.value.toUpperCase();
        this.searching = true;
        this.searched = false;
        this.notFound = false;
        this.vehiculo = null;

        try {
            const result = await firstValueFrom(this.vehiculoService.getVehiculoByPlaca(placa));
            this.searching = false;
            this.searched = true;
            if (result && result.length > 0) {
                this.vehiculo = { ...result[0].data, id: result[0].id } as VehiculoModel;
                this.notFound = false;
            } else {
                this.notFound = true;
            }
        } catch (error) {
            console.error('Error searching vehiculo:', error);
            this.searching = false;
            this.searched = true;
            this.notFound = true;
        }
    }

    assignVehiculo() {
        if (this.vehiculo) {
            this.dialogRef.close(this.vehiculo);
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
