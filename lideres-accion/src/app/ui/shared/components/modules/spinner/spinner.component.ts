import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  @Input() showSpinner: boolean = false

}
