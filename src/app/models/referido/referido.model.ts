import { RolesModel } from '../roles/roles.model';

export interface ReferidoModel {
  id: string; // documento de identidad
  isInterno: boolean;
  nombres: string;
  apellidos: string;
  iglesia: string;  // Iglesia que le cuenta
  departamento: string;
  municipio: string;
  comuna: string;
  barrio: string;
  direccion: string;
  celular: string;
  email?: string;
  rol?: RolesModel;
  esEmprendedor?: boolean;
  fechaNacimiento?: string;
  lugarVotacion?: LugarVotacionModel;
  referidoPor: string; // id / documento de identidad de quien lo refirio
  votaraPor: VotalModel;
}

export interface LugarVotacionModel {
  departamento: string;
  municipio: string;
  lugar: string;
  mesa: string;
}

export interface VotalModel {
  senado: boolean;
  camara: boolean;
}
