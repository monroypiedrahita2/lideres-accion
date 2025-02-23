import { LugarModel } from "../lugar/lugar.model";

export interface IglesiaModel {
    nombre: string;
    departamento: LugarModel;
    municipio: LugarModel;
}