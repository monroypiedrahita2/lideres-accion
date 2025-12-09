import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CommonModule } from '@angular/common';

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
    MatDialogActions,
    MatDialogClose,
    ButtonComponent,
],
  templateUrl: './dialog-nofication.component.html',
  styleUrls: ['./dialog-nofication.component.scss']
})




export class DialogNotificationComponent {


    constructor(
    public dialogRef: MatDialogRef<DialogNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly router: Router

  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }



  confirm(): void {
    this.dialogRef.close(true);
  }





}
