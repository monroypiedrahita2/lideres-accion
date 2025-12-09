import { Component } from '@angular/core';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SelectOptionsModel } from '../../../../models/base/select-options.model';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { COLORES_VEHICULOS, MARCAS_VEHICULOS, TIPOS_VEHICULOS } from '../../../shared/const/marcas.const';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mi-vehiculo',
  standalone: true,
  imports: [SubTitleComponent, InputTextComponent, InputSelectComponent, FormsModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './mi-vehiculo.component.html',
  styleUrls: ['./mi-vehiculo.component.scss']
})
export class MiVehiculoComponent {
  form!: FormGroup;
  loading: boolean = false;
  tipoVehiculos: SelectOptionsModel[] = TIPOS_VEHICULOS

  marcas: SelectOptionsModel[] = MARCAS_VEHICULOS

  modelos: SelectOptionsModel[] = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
    const year = 2000 + i;
    return { value: String(year), label: String(year) } as SelectOptionsModel;
  }).reverse();

  colores: SelectOptionsModel[] = COLORES_VEHICULOS

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly location: Location, private readonly vehiculoService: VehiculoService, private readonly auth: AuthService, public dialog: MatDialog) {
    this.form = this.fb.group({
      tipoVehiculo: ['', Validators.required],
      placaLetras: ['', [Validators.required, Validators.pattern('^[A-Z]*$'), Validators.maxLength(3)]],
      placaNumeros: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      nombreModelo: ['', Validators.required],
      color: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const vehiculo: VehiculoModel = {
      tipoVehiculo: this.form.value.tipoVehiculo,
      marca: this.form.value.marca,
      modelo: this.form.value.modelo,
      nombreModelo: this.form.value.nombreModelo,
      color: this.form.value.color,
      conductorId: this.auth.uidUser(), // Aquí deberías asignar el ID del conductor actual
      nombre: this.form.value.nombres,
      apellidos: this.form.value.apellidos,
      celular: this.form.value.celular,
      placa:  `${this.form.value.placaLetras.toUpperCase()}-${this.form.value.placaNumeros}`
    }
    this.createVehiculo(vehiculo);
  }

  async createVehiculo(data: VehiculoModel): Promise<void> {
    this.loading = true;
    try {
    await this.vehiculoService.createVehiculo(data);
    this.openNotification();
    this.loading = false;
    this.router.navigate(['/private/home']);
    } catch (error) {
      console.error('Error al registrar el vehículo:', error);
      this.loading = false;
    }
  }

  back(): void {
    this.location.back();
  }

    openNotification() {
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Vehiculo registrado exitosamente',
          message: 'Sus datos han sido guardados.',
          bottons: 'one',
          type: 'success'
        }
      });
    }

}
