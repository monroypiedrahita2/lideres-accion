import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { ComunaCardComponent } from '../../../../shared/components/modules/comuna-card/comuna-card.component';

@Component({
  selector: 'app-listar-comunas',
  standalone: true,
  imports: [CommonModule, ComunaCardComponent],
  templateUrl: './listar-comunas.component.html',
  styleUrls: ['./listar-comunas.component.scss']
})
export class ListarComunasComponent implements OnInit {
  comunas: BaseModel<ComunaModel>[] = [];

  constructor(private comunaService: ComunaService) {}

  ngOnInit(): void {
    this.comunaService.getComunas().subscribe((comunas: BaseModel<ComunaModel>[]) => {
      this.comunas = comunas;
    });
  }
}
