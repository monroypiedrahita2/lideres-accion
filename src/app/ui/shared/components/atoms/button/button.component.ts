import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mg-button',
  templateUrl: './button.component.html',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class ButtonComponent {
  @Input() type: 'submit' | 'reset' = 'submit';
  @Input() text: string = 'text';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = this.loading == false ? false : true;
  @Input() icon!: string;
  @Output() onClick = new EventEmitter<void>();
  
  submit(){
    if (this.disabled) {
      return;
    }
    this.onClick.emit()
  }
  
}
