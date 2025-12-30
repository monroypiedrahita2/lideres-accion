import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mtt-card-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './card-info.component.html',
})
export class CardInfoComponent {
  @Input() icon: string = 'home';
  @Input() title: string = 'title';
  @Input() textInfo: string = 'textInfo';
  @Input() activePoint: boolean = false;

}
