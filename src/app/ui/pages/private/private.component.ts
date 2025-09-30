import { Component } from '@angular/core';
import { NavComponent } from '../../shared/components/organism/nav/nav.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/modules/footer/footer.component';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  standalone: true,
  imports: [RouterModule, NavComponent, RouterOutlet, FooterComponent],
  styleUrl: './private.component.css',
})
export class PrivateComponent {

}
