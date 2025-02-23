import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'mg-button-settings',
  templateUrl: './button-settings.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class ButtonSettingsComponent {
  @Input() text: string = 'text';

}
