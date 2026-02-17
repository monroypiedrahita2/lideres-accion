import { IglesiaModel } from "../iglesia/iglesia.model";

export interface CasaApoyoModel {
    barrio: string;  //nombre segun el barrioId
    municipio: string;
    direccion: string;
    nombreHabitante: string;
    telefonoHabitante: string;
    responsableId: string;
    responsableNombre: string;
    responsableApellido: string;
    responsableTelefono: string;
    iglesia: IglesiaModel | null;
    aprobado: boolean | null;
    aprobadoPor: string | null; //email de quien aprobo con authService
}

