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
  @Input() canDelete: boolean = false;
  @Input() icon: string = 'edit';
  @Input() icon2: string = 'delete';
  @Input() title: string = 'title';
  @Input() textInfo: string = '';
  @Input() textInfo2: any = 'textInfo2';
  @Input() textInfo3: any = '';
  @Input() textInfo4: any = '';
  @Input() textbadge: any = 'Senado';
  @Input() textbadge2: any = 'Camara';
  @Input() badge: boolean = false;
  @Input() badge2: boolean = false;
  @Input() esInterno: boolean = false;
  @Input() votacion: boolean = false;
  @Input() puestodevotacion: string = '';
  @Input() mesadevotacion: string = '';
  @Output() eventEdit: EventEmitter<any> = new EventEmitter
  @Output() evenFilterReferidos: EventEmitter<any> = new EventEmitter
  @Output() eventDelete: EventEmitter<any> = new EventEmitter


  edit() {
    this.eventEdit.emit();
  }

  eliminar() {
    this.eventDelete.emit();
  }

  filterReferidos() {
    this.evenFilterReferidos.emit();
  }



}
