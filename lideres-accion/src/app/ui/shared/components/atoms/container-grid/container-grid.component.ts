import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonsFormComponent } from '../../modules/buttons-form/buttons-form.component';

@Component({
  selector: 'mg-container-grid',
  templateUrl: './container-grid.component.html',
  standalone: true,
  imports: [CommonModule, ButtonsFormComponent],
})
export class ContainerGridComponent {
  @Input() disabled: boolean = false;;
  @Input() loading: boolean = false;
  @Input() principalText: string = 'Guardar';
  @Input() backText: string = 'Regresar';
  @Output() onSubmit = new EventEmitter<void>();  


  clickear() {
    this.onSubmit.emit()
  }
 
}
