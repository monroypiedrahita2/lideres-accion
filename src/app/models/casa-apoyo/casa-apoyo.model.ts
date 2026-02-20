import { IglesiaModel } from "../iglesia/iglesia.model";

export interface CasaApoyoModel {
    id?: string; // uid de la persona que inscribe la casa de apoyo
    barrio: string;  //nombre segun el barrioId
    direccion: string;
    nombreHabitante: string;
    telefonoHabitante: string;
    responsableNombre: string;
    responsableApellido: string;
    responsableTelefono: string;
    iglesia: IglesiaModel | null;
    aprobado: boolean | null;
    aprobadoPor: string | null; //email de quien aprobo con authService
}

