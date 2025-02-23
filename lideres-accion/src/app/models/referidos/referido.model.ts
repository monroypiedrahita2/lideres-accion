import { LugarModel } from "../lugar/lugar.model";

export interface ReferidoModel {
    nombre: string;
    apellido: string;
    email?: string;
    residencia: ResidenciaModel
    telefono: string;
    direccion?: string;
    barrio: string;
    apoya: ApoyoModel

}

export interface ApoyoModel {
    senado: boolean;
    camara: boolean;
}
export interface ResidenciaModel {
    departamento: LugarModel;
    municipio: LugarModel;
    barrio: BarrioModel;
}

export interface BarrioModel {
    id?: string;
    municipio_id: number
    nombre: string;
    comuna: ComunaModel
} 

export interface ComunaModel {
    id?: number;
    nombre: string;
    municipio_id: number;
}