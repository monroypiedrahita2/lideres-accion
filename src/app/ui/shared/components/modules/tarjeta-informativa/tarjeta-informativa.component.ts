import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lida-tarjeta-informativa',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './tarjeta-informativa.component.html',
})
export class TarjetaInformativaComponent {
  @Input() mensaje: string = 'mensaje';

}
