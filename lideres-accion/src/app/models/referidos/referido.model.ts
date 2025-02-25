import { LugarModel } from "../lugar/lugar.model";

export interface ReferidoModel {
    nombre: string;
    apellido: string;
    email?: string;
    telefono: string;
    direccion?: string;
    barrio: string;
    apoya: ApoyoModel

}

export interface ApoyoModel {
    senado: boolean;
    camara: boolean;
}




