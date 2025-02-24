import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'mg-buttons-form',
  templateUrl: './buttons-form.component.html',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
})
export class ButtonsFormComponent {
  @Input() disabled: boolean = false;
  @Input() hiddenSecundaryBtn: boolean = false;
  @Input() loading: boolean = false;
  @Input() principalText: string = 'Guardar';
  @Input() backText: string = 'Regresar';
  @Output() onSubmit = new EventEmitter<void>();  
  


  constructor(public location: Location) {}


  clickear() {
    this.onSubmit.emit()
  }


  back() {
    this.location.back();
  }
}
