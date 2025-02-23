import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { DividerComponent } from '../divider/divider.component';

@Component({
  selector: 'mg-sub-title',
  templateUrl: './sub-title.component.html',
  standalone: true,
  imports: [CommonModule, DividerComponent],
})
export class SubTitleComponent {
  @Input() title: string = 'title';
  @Input() isAlert: boolean = false;

}
