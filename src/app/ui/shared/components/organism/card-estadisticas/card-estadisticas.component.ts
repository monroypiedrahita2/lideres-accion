import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-estadisticas',
  templateUrl: './card-estadisticas.component.html',
  standalone: true,
})
export class CardEstadisticasComponent implements OnInit {
  @Input() number: number = 150;
  @Input() info: string = 'Usuarios Registrados';

  constructor() { }

  ngOnInit() {
  }

}
