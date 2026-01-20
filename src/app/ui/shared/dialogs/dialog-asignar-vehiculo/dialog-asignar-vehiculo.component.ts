
import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { firstValueFrom, Subscription } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
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
export class DialogAsignarVehiculoComponent implements OnInit, OnDestroy {
    vehiculos: VehiculoModel[] = [];
    selectedVehiculos: Set<string> = new Set();
    loading: boolean = true;
    private subscription: Subscription = new Subscription();

    private casaApoyoService = inject(CasaApoyoService);

    constructor(
        private vehiculoService: VehiculoService,
        public dialogRef: MatDialogRef<DialogAsignarVehiculoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaId: string, iglesiaId: string }
    ) { }

    ngOnInit(): void {
        this.loadVehiculos();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    loadVehiculos() {
        if (!this.data.iglesiaId) {
            console.error('No iglesiaId provided');
            this.loading = false;
            return;
        }

        // Use getVehiculosAprobadosByIglesia and filter locally to ensure consistency
        // This subscription will stay active until the dialog is closed, receiving real-time updates
        const sub = this.vehiculoService.getVehiculosAprobadosByIglesia(this.data.iglesiaId).subscribe({
            next: (val) => {
                // Strict filter: Exclude any vehicle that has a truthy casaApoyoId
                this.vehiculos = val.filter(v => !v.casaApoyoId);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading vehicles', err);
                this.loading = false;
            }
        });

        this.subscription.add(sub);
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
            await this.casaApoyoService.addVehiculoToCasa(this.data.casaId, vehiculo);
        });

        try {
            await Promise.all(promises);
            this.dialogRef.close(selectedList);
        } catch (error) {
            console.error('Error assigning vehicles', error);
        } finally {
            this.loading = false;
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
