import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MisCarrerasComponent } from './mis-carreras/mis-carreras.component';
import { BuscarCarreraComponent } from './buscar-carrera/buscar-carrera.component';
import { AprobacionesComponent } from './aprobaciones/aprobaciones.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-tab-carreras',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MisCarrerasComponent,
    BuscarCarreraComponent,
    AprobacionesComponent
  ],
  templateUrl: './tab-carreras.component.html',
  styleUrls: ['./tab-carreras.component.scss']
})
export class TabCarrerasComponent {
  @Input() vehiculoEstado: string | undefined;
  hasActiveApproval: boolean = false;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

  constructor() { }

  onActiveRaceChange(isActive: boolean) {
    this.hasActiveApproval = isActive;
  }

  get canCreateCarrera(): boolean {
    const { rol, coordinadorCasaApoyo, coordinadorTransporte } = this.usuario;
    const allowedRoles = [
      'Coordinador de iglesia',
      'Coordinador de transporte',
      'Coordinador de casa de apoyo',
      'Pastor'
    ];

    return allowedRoles.includes(rol || '') ||
      !!coordinadorCasaApoyo ||
      !!coordinadorTransporte;
  }
}
