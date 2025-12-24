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
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-dialog-casas-apoyo',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        CommonModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        ButtonComponent,
        RouterLink
    ],
    template: `
    <span class="mt-4 font-primary font-bold text-center text-[24px] ">Casas de apoyo</span>
    <mat-dialog-content>
      <p class="text-center font-primary">Seleccione la opcion que desea</p>
    </mat-dialog-content>
    <mat-dialog-actions class="w-full flex flex-col gap-4">
      <mg-button mat-dialog-close  size="big" text="Mi casa de apoyo" class="w-full" icon="home" routerLink="/private/mi-casa-apoyo"></mg-button>
      @if(this.usuario.rol === 'Pastor' || this.usuario.rol === 'Super Usuario' || this.usuario.rol === 'Coordinador de iglesia') {
        <mg-button  mat-dialog-close  size="big" text="Casas inscritas" class="w-full" icon="list"></mg-button>
      }
      @if(this.usuario.rol === 'Pastor' || this.usuario.rol === 'Super Usuario' || this.usuario.rol === 'Coordinador de iglesia') {
        <mg-button mat-dialog-close  size="big" text="Inscribir casa" class="w-full" icon="add_home" routerLink="/private/inscribir-casas-apoyo"></mg-button>
      }
      <button mat-button (click)="onNoClick()">Cerrar</button>
    </mat-dialog-actions>
    `,
    styleUrls: ['./dialog-casas-apoyo.component.scss']
})
export class DialogCasasApoyoComponent {
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');


    constructor(
        public dialogRef: MatDialogRef<DialogCasasApoyoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly router: Router

    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    gotoLink(url: string): void {
        // this.router.navigate([url]);
    }

}
