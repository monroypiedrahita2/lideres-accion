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

  ) {
    this.dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }



  confirm(): void {
    this.dialogRef.close(true);
  }

  // Getters removed in favor of template logic





}
