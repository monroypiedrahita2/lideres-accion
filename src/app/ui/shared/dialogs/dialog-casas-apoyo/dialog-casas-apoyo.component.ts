import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-casas-apoyo',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ButtonComponent,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './dialog-casas-apoyo.component.html',
  styleUrls: ['./dialog-casas-apoyo.component.scss']
})
export class DialogCasasApoyoComponent {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

  constructor(
    public dialogRef: MatDialogRef<DialogCasasApoyoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const isPrivileged = this.usuario.rol === 'Pastor' ||
      this.usuario.rol === 'Super usuario' ||
      this.usuario.rol === 'Coordinador de iglesia' ||
      this.usuario.coordinadorCasaApoyo;

    if (!isPrivileged) {
      this.dialogRef.close();
      this.router.navigate(['/private/mi-casa-de-apoyo']);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  gotoLink(url: string): void {
    // this.router.navigate([url]);
  }

}
