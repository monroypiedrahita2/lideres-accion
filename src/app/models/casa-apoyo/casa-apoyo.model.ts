export interface CasaApoyoModel {
    barrioId: string;
    barrio: string;  //nombre segun el barrioId
    municipio: string; //nombre segun el barrioId
    direccion: string;
    nombreHabitante: string;
    telefonoHabitante: string;
    responsableId: string;
    responsableNombre: string;
    responsableApellido: string;
    responsableTelefono: string;
    iglesiaId: string | null;
    aprobado: boolean | null;
    aprobadoPor: string | null; //email de quien aprobo con authService
}

