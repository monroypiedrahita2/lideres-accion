import { IglesiaModel } from "../iglesia/iglesia.model";

export interface TestigoModel {
    nombre: string;
    apellido: string;
    iglesia: IglesiaModel | null;
    celular: string;
    puestoId: string;
    puestodevotacion: string;
    mesadevotacion: string;
    foto?: string | null; // foto se toma de authService de foto       
}