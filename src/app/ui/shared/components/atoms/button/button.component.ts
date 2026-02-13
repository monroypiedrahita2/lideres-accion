import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'mg-button',
  templateUrl: './button.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ButtonComponent {
  @Input() type: 'submit' | 'reset' = 'submit';
  @Input() text: string = 'text';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = this.loading;
  @Input() icon!: string;
  @Input() size: 'small' | 'big' = 'big';
  @Output() onClick = new EventEmitter<void>();

  submit() {
    if (this.disabled || this.loading) {
      return;
    }
    this.onClick.emit()
  }

}
