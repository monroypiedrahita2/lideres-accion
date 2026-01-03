
import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { firstValueFrom } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button'; // Ensure button types are correct
import { CasaApoyoService } from '../../services/casa-apoyo/casa-apoyo.service';

@Component({
    selector: 'app-dialog-asignar-vehiculo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        MatCheckboxModule,
        FormsModule,
        MatButtonModule
    ],
    templateUrl: './dialog-asignar-vehiculo.component.html',
    styleUrls: ['./dialog-asignar-vehiculo.component.scss']
})
export class DialogAsignarVehiculoComponent implements OnInit {
    vehiculos: VehiculoModel[] = [];
    selectedVehiculos: Set<string> = new Set();
    loading: boolean = true;

    private casaApoyoService = inject(CasaApoyoService);

    constructor(
        private vehiculoService: VehiculoService,
        public dialogRef: MatDialogRef<DialogAsignarVehiculoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaId: string, iglesiaId: string }
    ) { }

    ngOnInit(): void {
        this.loadVehiculos();
    }

    loadVehiculos() {
        if (!this.data.iglesiaId) {
            console.error('No iglesiaId provided');
            this.loading = false;
            return;
        }

        this.vehiculoService.getVehiculosByIglesia(this.data.iglesiaId).subscribe({
            next: (val) => {
                // Filter: not assigned (no casaApoyoId) AND approved
                this.vehiculos = val.filter(v => !v.casaApoyoId && v.aprobado === true);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading vehicles', err);
                this.loading = false;
            }
        });
    }

    toggleSelection(vehiculoId: string) {
        if (this.selectedVehiculos.has(vehiculoId)) {
            this.selectedVehiculos.delete(vehiculoId);
        } else {
            this.selectedVehiculos.add(vehiculoId);
        }
    }

    async onSave() {
        this.loading = true;
        const selectedList = this.vehiculos.filter(v => this.selectedVehiculos.has(v.id!));

        const promises = selectedList.map(async vehiculo => {
            // 1. Update Vehicle: set casaApoyoId
            await this.vehiculoService.updateVehiculo(vehiculo.id!, { casaApoyoId: this.data.casaId } as unknown as VehiculoModel);

            // 2. Update House: add to vehiculos array
            // Note: addVehiculoToCasa expects 'any' (the whole vehicle object or partial?)
            // Usually we store the whole object in array or just ID. 
            // Existing code pushed the whole object. Let's do that.
            // But we should probably update checks to ensure no duplication, but we heavily rely on UI state here.
            await this.casaApoyoService.addVehiculoToCasa(this.data.casaId, vehiculo);
        });

        try {
            await Promise.all(promises);
            this.dialogRef.close(selectedList);
        } catch (error) {
            console.error('Error assigning vehicles', error);
            // Handle error
        } finally {
            this.loading = false;
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
