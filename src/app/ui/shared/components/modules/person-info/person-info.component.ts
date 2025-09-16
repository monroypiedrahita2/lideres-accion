import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lida-person-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './person-info.component.html',
})
export class PersonInfoComponent {
  @Input() icon: string = 'edit';
  @Input() title: string = 'title';
  @Input() textInfo: string = 'textInfo';
  @Output() eventEdit: EventEmitter<any> = new EventEmitter


  edit() {
    this.eventEdit.emit();
  }



}
