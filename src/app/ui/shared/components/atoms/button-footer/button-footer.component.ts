import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button-footer',
  templateUrl: './button-footer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    RouterModule
  ],
  styleUrl: './button-footer.component.css'
})
export class ButtonFooterComponent {
  @Input() option: string = 'option';
  @Input() icon: string = 'directions_car';
  @Input() goTo: string = '/home';



}
