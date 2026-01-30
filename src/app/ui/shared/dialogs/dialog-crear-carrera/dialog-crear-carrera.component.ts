import { Component, Inject, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { MatButtonModule } from '@angular/material/button';
import { InputSelectComponent } from '../../components/atoms/input-select/input-select.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PuestoVotacionService } from '../../services/puesto-votacion/puesto-votacion.service';
import { SelectOption } from '../../components/atoms/input-select/input-select.component';
import { CarreraService } from '../../services/carrera/carrera.service';
import { DialogNotificationComponent } from '../dialog-notification/dialog-nofication.component';

@Component({
    selector: 'app-dialog-crear-carrera',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        InputTextComponent,
        ButtonComponent,
        MatButtonModule,
        InputSelectComponent,
        MatCheckboxModule
    ],
    templateUrl: './dialog-crear-carrera.component.html',
    styleUrls: ['./dialog-crear-carrera.component.scss']
})
export class DialogCrearCarreraComponent implements OnInit {
    form: FormGroup;
    loading: boolean = false;
    usarUbicacionActual: boolean = false;

    tipoVehiculoOptions = [
        { label: 'Moto', value: 'Moto' },
        { label: 'Carro', value: 'Carro' },
        { label: 'Camioneta', value: 'Camioneta' },
        { label: 'Van', value: 'Van' },
        { label: 'Bus', value: 'Bus' }
    ];

    puestosVotacionOptions: SelectOption[] = [];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<DialogCrearCarreraComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private ngZone: NgZone,
        private puestoVotacionService: PuestoVotacionService,
        private carreraService: CarreraService,
        private dialog: MatDialog
    ) {
        this.form = this.fb.group({
            telefonoSolicitante: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            telefonoVotante: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            tipoVehiculo: ['', Validators.required],
            lugarRecogida: ['', Validators.required],
            puestoVotacionIr: ['', Validators.required],
            observaciones: [''],
            latitudSolicitante: [null],
            longitudSolicitante: [null]
        });
    }

    ngOnInit(): void {
        this.loadPuestosVotacion();
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.celular) {
                    this.form.patchValue({ telefonoSolicitante: user.celular });
                }
            } catch (e) {
                console.error('Error parsing user from local storage', e);
            }
        }
    }

    loadPuestosVotacion() {
        this.puestoVotacionService.getPuestosVotacion().subscribe(puestos => {
            this.puestosVotacionOptions = puestos
                .map(p => ({
                    label: p.data.nombre,
                    value: p.data.nombre
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
        });
    }

    toggleUbicacion(event: any) {
        this.usarUbicacionActual = event.checked;
        if (this.usarUbicacionActual) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    this.ngZone.run(() => {
                        this.form.patchValue({
                            latitudSolicitante: position.coords.latitude,
                            longitudSolicitante: position.coords.longitude,
                            lugarRecogida: 'Ubicación actual'
                        });
                    });
                }, (error) => {
                    this.ngZone.run(() => {
                        console.error("Error getting location", error);
                        this.usarUbicacionActual = false;
                        event.source.checked = false;
                    });
                });
            } else {
                console.error("Geolocation is not supported by this browser.");
                this.usarUbicacionActual = false;
            }
        } else {
            this.form.patchValue({
                latitudSolicitante: null,
                longitudSolicitante: null,
                lugarRecogida: ''
            });
        }
    }

    onSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        const carreraData = this.form.value;

        // Add additional data if needed, e.g. status
        const newCarrera = {
            ...carreraData,
            estado: 'Abierto',
            // Ensure numbers for coords if they exist
            latitudSolicitante: carreraData.latitudSolicitante ? Number(carreraData.latitudSolicitante) : null,
            longitudSolicitante: carreraData.longitudSolicitante ? Number(carreraData.longitudSolicitante) : null
        };

        this.carreraService.createCarrera(newCarrera).then(() => {
            this.loading = false;
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Éxito',
                    message: 'La carrera se creó correctamente.',
                    bottons: 'one', // Note: typo in model/component? 'bottons' seems to be the property name in DialogNotificationModel
                    type: 'success'
                }
            });
            this.dialogRef.close(true);
        }).catch((error) => {
            this.loading = false;
            console.error('Error creating carrera:', error);
            this.dialog.open(DialogNotificationComponent, {
                data: {
                    title: 'Error',
                    message: 'Hubo un error al crear la carrera. Por favor intente nuevamente.',
                    bottons: 'one',
                    type: 'error'
                }
            });
        });
    }

    cancel() {
        this.dialogRef.close();
    }
}
