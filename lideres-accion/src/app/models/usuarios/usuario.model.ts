import { DocumentReference } from '@angular/fire/firestore';
import { RolesModel } from '../roles/roles.model';
import { LugarModel } from '../lugar/lugar.model';


export interface UsuarioModel {
  nombres: string;
  apellidos: string;
  documento: string;
  departamento: string;
  municipio: string;
  comuna: string;
  barrio: string;
  direccion: string;
  celular: string;
  email?: string;
  iglesia?: string;
  rol?: RolesModel;
}


