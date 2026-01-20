import { Component, OnInit } from '@angular/core';
import { CardEstadisticasComponent } from '../../../shared/components/organism/card-estadisticas/card-estadisticas.component';
import { ReferidoService } from '../../../shared/services/referido/referido.service';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CardEstadisticasComponent],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  totalRegistros: number = 0;
  totalInternos: number = 0;
  totalExternos: number = 0;
  emprendedores: number = 0;
  senado: number = 0;
  camara: number = 0;
  sinPuesto: number = 0;

  constructor(private readonly referidoService: ReferidoService) {}

  ngOnInit(): void {
    this.contarReferidos();
  }



  async contarReferidos() {
    this.totalRegistros = await this.referidoService.countActiveIf(
      'data.iglesia',
      this.usuario.iglesia
    );
    this.totalInternos = await this.referidoService.countActiveIf(
      'data.isInterno',
      true
    );
    this.totalExternos = await this.referidoService.countActiveIf(
      'data.isInterno',
      false
    );
    this.emprendedores = await this.referidoService.countActiveIf(
      'data.esEmprendedor',
      true
    );
    this.senado = await this.referidoService.countActiveIf('data.senado', true);
    this.camara = await this.referidoService.countActiveIf('data.camara', true);
    this.sinPuesto = await this.referidoService.countActiveIf(
      'data.lugarVotacion',
      ''
    );
  }
}
