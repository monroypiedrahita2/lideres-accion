import { RolesModel } from '../roles/roles.model';


export interface UsuarioModel {
  id?: string;
  nombres: string;
  apellidos: string;
  documento: string;
  departamento: string;
  municipio: string;
  barrio: string;
  direccion: string;
  celular: string;
  email: string;
  iglesia: string;
  rol?: RolesModel;
}


