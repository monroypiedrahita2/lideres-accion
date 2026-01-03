import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';

@Component({
    selector: 'app-dialog-anadir-vehiculos-casa',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        FormsModule
    ],
    templateUrl: './dialog-anadir-vehiculos-casa.component.html',
    styles: [`
    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }
  `]
})
export class DialogAnadirVehiculosCasaComponent implements OnInit {
    vehiculos: VehiculoModel[] = [];
    selectedVehiculos: Set<string> = new Set();
    initiallyAssignedVehiculos: Set<string> = new Set();
    loading = true;

    constructor(
        public dialogRef: MatDialogRef<DialogAnadirVehiculosCasaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { casaApoyoId: string, iglesiaId: string },
        private vehiculoService: VehiculoService
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
                // Filter for approved vehicles that are either unassigned or assigned to this casa
                this.vehiculos = val.filter(v =>
                    (!v.casaApoyoId || v.casaApoyoId === this.data.casaApoyoId) && v.aprobado === true
                );

                // Pre-select vehicles already assigned to this casa
                this.vehiculos.forEach(v => {
                    if (v.casaApoyoId === this.data.casaApoyoId && v.id) {
                        this.selectedVehiculos.add(v.id);
                        this.initiallyAssignedVehiculos.add(v.id);
                    }
                });

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
        const promises: Promise<void>[] = [];

        // Assign selected vehicles to this casa
        Array.from(this.selectedVehiculos).forEach(vehiculoId => {
            promises.push(
                this.vehiculoService.updateVehiculo(vehiculoId, { casaApoyoId: this.data.casaApoyoId } as unknown as VehiculoModel)
            );
        });

        // Unassign vehicles that were initially assigned but are now deselected
        this.initiallyAssignedVehiculos.forEach(vehiculoId => {
            if (!this.selectedVehiculos.has(vehiculoId)) {
                promises.push(
                    this.vehiculoService.updateVehiculo(vehiculoId, { casaApoyoId: null } as unknown as VehiculoModel)
                );
            }
        });

        try {
            await Promise.all(promises);
            this.dialogRef.close(true);
        } catch (error) {
            console.error('Error updating vehicle assignments', error);
            // Handle error (maybe show toast)
        } finally {
            this.loading = false;
        }
    }

    onClose() {
        this.dialogRef.close();
    }
}
