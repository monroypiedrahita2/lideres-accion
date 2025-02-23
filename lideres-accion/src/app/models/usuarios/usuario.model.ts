import { IglesiaModel } from "../iglesia/iglesia.model";
import { ComunaModel } from "../referidos/referido.model";
import { RolesModel } from "../roles/roles.model";

export interface UsuarioModel {
    nombres: string;
    apellidos: string;
    comuna: ComunaModel;  // busqueda individual no en lista
    barrio: string;  // busqueda individual no en lista
    direccion: string; 
    celular: string;
    email?: string;
    iglesia: IglesiaModel;
    rol?: RolesModel
}