import { DocumentReference } from '@angular/fire/firestore';
import { RolesModel } from '../roles/roles.model';
export interface UsuarioModel {
  nombres: string;
  apellidos: string;
  documento: string;
  comuna?: DocumentReference;
  barrio: string;
  direccion: string;
  celular: string;
  email?: string;
  iglesia?: DocumentReference;
  rol?: RolesModel;
}


