import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mg-skeleton',
  templateUrl: './skeleton.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class SkeletonComponent {
  @Input() enableSkeleton: boolean = true;
  @Input() num: number = 4;

}
