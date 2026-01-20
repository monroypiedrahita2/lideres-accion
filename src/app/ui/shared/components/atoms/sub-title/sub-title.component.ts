import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mg-sub-title',
  templateUrl: './sub-title.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class SubTitleComponent {
  @Input() title: string = 'title';
  @Input() isAlert: boolean = false;

}
