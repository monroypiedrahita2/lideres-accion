import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

@Component({
  selector: 'lida-person-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './person-card.component.html',
})
export class PersonCardComponent {
  @Input({ required: true }) person!: PerfilModel;
  @Input() showDeleteAction: boolean = false;
  @Input() showEditAction: boolean = false;
  @Output() deleteClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<void>();

  onDelete() {
    this.deleteClicked.emit();
  }

  onEdit() {
    this.editClicked.emit();
  }
}
