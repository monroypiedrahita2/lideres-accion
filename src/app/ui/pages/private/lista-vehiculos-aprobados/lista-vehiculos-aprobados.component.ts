import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VehiculoService } from '../../../shared/services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { CardVehiculoComponent } from '../../../shared/components/cards/card-vehiculo/card-vehiculo.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-inscribir-vehiculos',
  standalone: true,
  imports: [
    CommonModule,
    CardVehiculoComponent,
    TitleComponent
  ],
  templateUrl: './lista-vehiculos-aprobados.component.html',
})
export class ListaVehiculosAprobadosComponent implements OnInit {
  private readonly vehiculoService = inject(VehiculoService);
  private readonly dialog = inject(MatDialog);
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Change type to match service return (BaseModel<VehiculoModel> or just VehiculoModel depending on how it's used, 
  // but let's stick to what we saw in the service: observable returns BaseModel<VehiculoModel>[])
  vehiculos: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.getVehiculos();
  }

  getVehiculos() {
    this.loading = true;

    // Validate that usuario.iglesiaId exists
    if (!this.usuario?.iglesia) {
      console.error('Usuario no tiene iglesiaId en localStorage:', this.usuario);
      this.loading = false;
      return;
    }

    if (this.usuario.iglesia.id) {
      this.vehiculoService.getVehiculosAprobadosByIglesia(this.usuario.iglesia?.id).subscribe({
        next: (data) => {
          this.vehiculos = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }



}
