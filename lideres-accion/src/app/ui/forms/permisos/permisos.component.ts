import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InputSelectComponent } from '../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../shared/components/atoms/title/title.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContainerGridComponent } from '../../shared/components/atoms/container-grid/container-grid.component';
import { SubTitleComponent } from '../../shared/components/atoms/sub-title/sub-title.component';
import { PermisosModel } from '../../../models/roles/roles.model';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [
    CommonModule,
    InputSelectComponent,
    TitleComponent,
    SubTitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
  ],
  templateUrl: './permisos.component.html',
})
export class PermisosComponent implements OnInit {
   formPermisos!: FormGroup
   @Output() permisosEvent: EventEmitter<PermisosModel> = new EventEmitter()
   @Input() title: string = 'PERMISOS'
   @Input() disabled: boolean = false
   @Input() permisos!: PermisosModel


   constructor(private location: Location, private fb: FormBuilder) {

    this.formPermisos = this.fb.group({
    // Usuarios
      usuariosTodos: [false],
      usuariosDepartamento: [false],
      usuariosMunicipio: [false],
      usuariosIglesia: [false],
      usuariosComuna: [false],

      // Refridos
      referidosTodos: [false],
      referidosDepartamento: [false],
      referidosMunicipio: [false],
      referidosIglesia: [false],
      referidosComuna: [false],



      // Permisos
      permisosTodos: [false],
      permisosDepartamento: [false],
      permisosMunicipio: [false],
      permisosIglesia: [false],
      permisosComuna: [false],

      //Iglesias
      crearIglesias: [false],
      editarIglesias: [false],
      eliminarIglesias: [false],

      //Comunas
      crearComunas: [false],
      editarComunas: [false],
      eliminarComunas: [false],
    })

   }

   ngOnInit(): void {
      if (this.permisos) {
        this.formPermisos.patchValue(this.permisos)
      }
      if (this.disabled) {
        this.formPermisos.disable()
      }
   }



   onSubmit() {
    this.permisosEvent.emit(this.formPermisos.value)
   }
}
