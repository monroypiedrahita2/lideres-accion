import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mg-logo',
  templateUrl: './logo.component.html',
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class LogoComponent {

}
