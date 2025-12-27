import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { BaseModel } from '../../../../../models/base/base.model';


@Component({
  selector: 'app-comuna-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './comuna-card.component.html',
  styleUrls: ['./comuna-card.component.scss']
})
export class ComunaCardComponent {
  @Input() comuna!: BaseModel<ComunaModel>;
  @Output() eventDelete = new EventEmitter<string>();

  onDelete() {
    this.eventDelete.emit(this.comuna.id);
  }
}
