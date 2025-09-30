import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lida-confirm-action',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-action.component.html',
})
export class ConfirmActionComponent {
  @Input() data: {name: string, id: string} = {name: '', id: ''};
  @Input() icon2: string = 'delete';

  @Input() showModal: boolean = false;


  @Output() eventConfirm: EventEmitter<any> = new EventEmitter
  @Output() eventBack: EventEmitter<any> = new EventEmitter




  confirm(id: string) {
    this.eventConfirm.emit();
    this.showModal = false
  }

  back() {
    this.showModal = false
  }



}
