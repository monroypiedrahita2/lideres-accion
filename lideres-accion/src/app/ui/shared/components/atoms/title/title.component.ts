import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'mg-title',
  templateUrl: './title.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class TitleComponent {
  @Input() title: string = 'title';
}
