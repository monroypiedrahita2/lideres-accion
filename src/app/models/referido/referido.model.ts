
export interface ReferidoModel {
  id?: string; // documento de identidad
  isInterno: boolean;
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email?: string;
  esEmprendedor?: boolean;
  comuna: string;
  barrio: string;
  direccion: string;
  iglesia: string;  // Iglesia que tiene la cuenta
  fechaNacimiento?: string;
  lugarVotacion?: string;
  mesaVotacion?: string;
  referidoPor: string; // id / documento de identidad de quien lo refirio
  senado: boolean;
  camara: boolean;
}
