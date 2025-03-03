import { UsuarioModel } from "../usuarios/usuario.model";

export interface LiderModel extends UsuarioModel {
  esEmprendedor?: boolean;
  fechaNacimiento?: string;
  lugarVotacion?: LugarVotacionModel;

}


export interface LugarVotacionModel {
    departamento: string;
    municipio: string;
    lugar: string;
    mesa: string
}
