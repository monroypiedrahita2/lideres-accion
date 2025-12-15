import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { DialogNotificationModel } from '../../../../models/base/dialog-notification.model';

@Component({
  selector: 'app-dialog-opciones-vehicular',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogClose,
    ButtonComponent,
    MatIconModule
],
  templateUrl: './dialog-nofication.component.html',
  styleUrls: ['./dialog-nofication.component.scss']
})




export class DialogNotificationComponent {


    constructor(
    public dialogRef: MatDialogRef<DialogNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNotificationModel,
    private readonly router: Router

  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }



  confirm(): void {
    this.dialogRef.close(true);
  }

  get icon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  get colorClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-primary';
    }
  }

  get bgIconClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-amber-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  }





}
