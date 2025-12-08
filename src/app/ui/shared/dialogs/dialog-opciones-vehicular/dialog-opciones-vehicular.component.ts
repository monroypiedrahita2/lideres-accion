import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';

@Component({
  selector: 'app-dialog-opciones-vehicular',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ButtonComponent
  ],
  templateUrl: './dialog-opciones-vehicular.component.html',
  styleUrls: ['./dialog-opciones-vehicular.component.scss']
})
export class DialogOpcionesVehicularComponent {


    constructor(
    public dialogRef: MatDialogRef<DialogOpcionesVehicularComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly router: Router

  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  gotoLink(url: string): void {
    // this.router.navigate([url]);
  }



}
