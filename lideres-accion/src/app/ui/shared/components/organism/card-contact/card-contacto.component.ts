import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'azul-card-contacto',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './card-contacto.component.html',
})
export class CardContactoComponent {
  @Input() titleR: string = 'titleR';
  @Input() subTitleR: string = 'subTitleR';
  @Input() titleL: string = 'titleL';
  @Input() subTitleL: string = 'subTitleL';
  @Input() description: string = 'description';
  @Input() id!: string;
  @Input() telefono!: string;
  @Output() eventEdit: EventEmitter<any> = new EventEmitter

    call() {
      window.open(`tel:${this.telefono}`, '_self');
    }

    chat() {
      window.open(`https://wa.me/${this.telefono}`, '_blank');
    }

    edit() {
      this.eventEdit.emit(this.id);
    }



}
