import { Component, OnInit } from '@angular/core';
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
import { SkeletonComponent } from '../../../shared/components/organism/skeleton/skeleton.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-mi-vehiculo',
  standalone: true,
  imports: [SubTitleComponent, InputTextComponent, InputSelectComponent, FormsModule, ReactiveFormsModule, ButtonComponent, SkeletonComponent],
  templateUrl: './mi-vehiculo.component.html',
})
export class MiVehiculoComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  tipoVehiculos: SelectOptionsModel[] = TIPOS_VEHICULOS
  vehiculoId: string = '';
  usuario: PerfilModel = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario') || '') : {} as PerfilModel;


  skeleton: boolean = true;

  marcas: SelectOptionsModel[] = MARCAS_VEHICULOS

  modelos: SelectOptionsModel[] = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
    const year = 2000 + i;
    return { value: String(year), label: String(year) } as SelectOptionsModel;
  }).reverse();

  colores: SelectOptionsModel[] = COLORES_VEHICULOS
  accion: 'Crear' | 'Editar' = 'Crear';

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly location: Location, private readonly vehiculoService: VehiculoService, private readonly auth: AuthService, public dialog: MatDialog) {
    this.form = this.fb.group({
      tipoVehiculo: ['', Validators.required],
      placaLetras: ['', [Validators.required, Validators.pattern('^[A-Z]*$'), Validators.maxLength(3)]],
      placaNumeros: ['', [Validators.required, Validators.pattern('^[0-9A-Z]*$'), Validators.maxLength(3)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      nombreModelo: ['', Validators.required],
      color: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
    });
  }

  ngOnInit(): void {
    this.vehiculoService.getVehiculoByConductor(this.auth.uidUser()).subscribe((vehiculos) => {
      if (vehiculos.length === 0) {
        this.accion = 'Crear';
        this.skeleton = false;
        this.patchUsuarioForm();
        return;
      }

      this.accion = 'Editar';

      const vehiculo: VehiculoModel = vehiculos[0];
      this.vehiculoId = vehiculos[0].id || '';
      this.form.patchValue({
        tipoVehiculo: vehiculo.tipoVehiculo,
        placaLetras: vehiculo.placa.split('-')[0],
        placaNumeros: vehiculo.placa.split('-')[1],
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        nombreModelo: vehiculo.nombreModelo,
        color: vehiculo.color,
        nombres: vehiculo.nombre,
        apellidos: vehiculo.apellidos,
        celular: vehiculo.celular,
      });

      this.skeleton = false;
    });

  }

  patchUsuarioForm(): void {
    this.form.patchValue({
      nombres: this.usuario.nombres,
      apellidos: this.usuario.apellidos,
      celular: this.usuario.celular,
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
      placa: `${this.form.value.placaLetras.toUpperCase()}-${this.form.value.placaNumeros}`,
      iglesiaId: this.usuario.iglesia || null
    }
    if (this.accion === 'Crear') {
      this.createVehiculo(vehiculo);
    }
    else {
      this.updateVehiculo(vehiculo);
    }
  }

  async updateVehiculo(data: VehiculoModel): Promise<void> {
    this.loading = true;
    try {
      await this.vehiculoService.updateVehiculo(this.vehiculoId, data);
      this.openNotification('Vehículo actualizado', 'Los datos de su vehículo han sido actualizados con éxito', 'success');
      this.loading = false;
      this.router.navigate(['/private/home']);
    } catch (error) {
      console.error('Error al registrar el vehículo:', error);
      this.loading = false;
    }
  }

  async createVehiculo(data: VehiculoModel): Promise<void> {
    this.loading = true;
    try {
      await this.vehiculoService.createVehiculo(data);
      this.openNotification('Vehículo registrado', 'Su vehículo ha sido registrado con éxito', 'success');
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

  openNotification(title: string, message: string, type: string): void {
    this.dialog.open(DialogNotificationComponent, {
      data: {
        title: title,
        message: message,
        bottons: 'one',
        type: type
      }
    });
  }

}
