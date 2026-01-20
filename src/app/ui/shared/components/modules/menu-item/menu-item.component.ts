import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mtt-menu-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() icon: string = '';
}
