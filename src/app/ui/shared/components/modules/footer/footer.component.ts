import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NAME_APP } from '../../../const/name-app.const';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonFooterComponent } from '../../atoms/button-footer/button-footer.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogAsociarIglesiaComponent } from '../../../dialogs/dialog-asociar-iglesia/dialog-asociar-iglesia.component';
import { Subscription } from 'rxjs';
import { PerfilService } from '../../../services/perfil/perfil.service';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { VehiculoService } from '../../../services/vehiculo/vehiculo.service';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';
import { MisCarrerasComponent } from '../mis-carreras/mis-carreras.component';
import { AprobacionesComponent } from '../aprobaciones/aprobaciones.component';
import { BuscarCarreraComponent } from '../buscar-carrera/buscar-carrera.component';
import { DialogCrearCarreraComponent } from '../../../dialogs/dialog-crear-carrera/dialog-crear-carrera.component';

@Component({
  selector: 'mtt-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonFooterComponent,
    RouterModule,
    MatBottomSheetModule
  ],
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  title: string = NAME_APP;
  private userSubscription: Subscription | undefined;
  private vehiculoSubscription: Subscription | undefined;
  currentVehiculo: VehiculoModel | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly perfilService: PerfilService,
    private readonly _bottomSheet: MatBottomSheet,
    private readonly vehiculoService: VehiculoService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.perfilService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
      }
    });

    this.vehiculoSubscription = this.vehiculoService.currentVehiculo$.subscribe(vehiculo => {
      this.currentVehiculo = vehiculo;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.vehiculoSubscription) {
      this.vehiculoSubscription.unsubscribe();
    }
  }

  openAsociarIglesia() {
    this.dialog.open(DialogAsociarIglesiaComponent, {
      width: '500px',
      data: {}
    });
  }

  openDialogCrearCarrera() {
    this.dialog.open(DialogCrearCarreraComponent, {
      width: '400px',
      data: { usuario: this.usuario }
    });
  }

  openMisCarreras() {
    this._bottomSheet.open(MisCarrerasComponent);
  }

  openAprobaciones() {
    this._bottomSheet.open(AprobacionesComponent);
  }

  openBuscarCarrera() {
    this._bottomSheet.open(BuscarCarreraComponent);
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

  get showAprobaciones(): boolean {
    return !!this.currentVehiculo?.aprobado;
  }

  get showBuscarCarrera(): boolean {
    const estado = this.currentVehiculo?.estado;
    return (estado !== 'En carrera' && estado !== 'Inactivo') && !!this.currentVehiculo?.aprobado;
  }
}
