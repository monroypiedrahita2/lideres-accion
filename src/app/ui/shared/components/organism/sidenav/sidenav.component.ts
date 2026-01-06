import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CARDS_HOME } from '../../../const/cards.const';
import { CardModel } from '../../../../../models/utils/card.model';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { AuthService } from '../../../services/auth/auth.service';
import { DialogOpcionesVehicularComponent } from '../../../dialogs/dialog-opciones-vehicular/dialog-opciones-vehicular.component';
import { DialogCasasApoyoComponent } from '../../../dialogs/dialog-casas-apoyo/dialog-casas-apoyo.component';
import { DialogTestigosComponent } from '../../../dialogs/dialog-opciones-testigos/dialog-testigos.component';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';

@Component({
    selector: 'mg-sidenav',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, MatDialogModule],
    templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
    @Input() isOpen = false;
    @Input() usuario!: PerfilModel;
    @Output() close = new EventEmitter<void>();

    cards = CARDS_HOME;

    constructor(
        private readonly auth: AuthService,
        private readonly router: Router,
        public dialog: MatDialog
    ) { }

    get userRol(): string {
        return this.usuario?.rol || '';
    }

    showCard(rol: string[] | undefined, requiresPostulacion?: string): boolean {
        if (!rol) return false;
        if (!this.usuario) return false;
        const roleAllowed = rol.includes(this.userRol) || rol.includes('Todos');
        if (!roleAllowed) return false;
        if (requiresPostulacion) {
            if (!this.usuario.postulado) return false;
            return (this.usuario.postulado as any)[requiresPostulacion] === true;
        }
        return true;
    }

    handleClick(card: CardModel) {
        if (card.action) {
            this.openDialog(card.action);
        }
        this.close.emit();
    }

    openDialog(action: string) {
        switch (action) {
            case 'vehiculo':
                this.dialog.open(DialogOpcionesVehicularComponent, {
                    data: { name: 'mi-carro' },
                    width: '300px',
                });
                break;
            case 'casa-apoyo':
                this.dialog.open(DialogCasasApoyoComponent, {
                    data: { name: 'mi-casa-apoyo' },
                    width: '300px',
                });
                break;
            case 'testigo':
                this.dialog.open(DialogTestigosComponent, {
                    data: { name: 'mi-testigos' },
                    width: '300px',
                });
                break;
        }
    }

    logout() {
        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            data: { title: 'Cerrar sesión', message: '¿Estás seguro que deseas cerrar sesión?', type: 'warning', bottons: 'two' },
            width: '400px',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.auth.logout();
                this.router.navigate(['./public/login']);
                this.close.emit();
            }
        });
    }
}
