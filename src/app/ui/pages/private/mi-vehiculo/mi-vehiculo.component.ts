import { Component } from '@angular/core';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SelectOptionsModel } from '../../../../models/base/select-options.model';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-mi-vehiculo',
  standalone: true,
  imports: [SubTitleComponent, InputTextComponent, InputSelectComponent, FormsModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './mi-vehiculo.component.html',
  styleUrls: ['./mi-vehiculo.component.scss']
})
export class MiVehiculoComponent {
  form!: FormGroup;
  tipoVehiculos: SelectOptionsModel[] = [
    { value: 'carro', label: 'Carro' },
    { value: 'moto', label: 'Moto' },
    { value: 'Camioneta', label: 'Camioneta' },
  ];

  marcas: SelectOptionsModel[] = [
    { value: 'chevrolet', label: 'Chevrolet' },
    { value: 'toyota', label: 'Toyota' },
    { value: 'nissan', label: 'Nissan' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'kia', label: 'Kia' },
    { value: 'ford', label: 'Ford' },
    { value: 'renault', label: 'Renault' },
    { value: 'suzuki', label: 'Suzuki' },
    { value: 'honda', label: 'Honda' },
    { value: 'mazda', label: 'Mazda' },
    { value: 'volkswagen', label: 'Volkswagen' },
    { value: 'peugeot', label: 'Peugeot' },
    { value: 'yamaha', label: 'Yamaha' },
    { value: 'bmw', label: 'BMW' },
    { value: 'audi', label: 'Audi' },
    { value: 'mercedes', label: 'Mercedes' },
    { value: 'porsche', label: 'Porsche' },
    { value: 'landrover', label: 'Land Rover' },
    { value: 'jaguar', label: 'Jaguar' },
    { value: 'lexus', label: 'Lexus' },
    { value: 'mini', label: 'Mini' },
    { value: 'volvo', label: 'Volvo' },
    { value: 'otro', label: 'Otro' },
  ];

  modelos: SelectOptionsModel[] = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
    const year = 2000 + i;
    return { value: String(year), label: String(year) } as SelectOptionsModel;
  }).reverse();

  colores: SelectOptionsModel[] = [
    { value: 'blanco', label: 'Blanco' },
    { value: 'negro', label: 'Negro' },
    { value: 'gris', label: 'Gris' },
    { value: 'azul', label: 'Azul' },
    { value: 'rojo', label: 'Rojo' },
    { value: 'verde', label: 'Verde' },
    { value: 'amarillo', label: 'Amarillo' },
    { value: 'marron', label: 'Marrón' },
    { value: 'plata', label: 'Plata' },
    { value: 'otro', label: 'Otro' },
  ];

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly location: Location) {
    this.form = this.fb.group({
      tipoVehiculo: ['', Validators.required],
      placaLetras: ['', [Validators.required, Validators.pattern('^[A-Z]*$'), Validators.maxLength(3)]],
      placaNumeros: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      color: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: integrar con servicio para persistir datos
    console.log('MiVehiculo formulario enviado:', this.form.value);
  }

  back(): void {
    this.location.back();
  }

}
