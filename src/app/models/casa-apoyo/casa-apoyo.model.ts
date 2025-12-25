export interface CasaApoyoModel {
    barrioId: string;
    barrio: string;
    municipio: string;
    direccion: string;
    nombreHabitante: string;
    telefonoHabitante: string;
    responsableId?: string;
    responsableNombre?: string;
    responsableCedula?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
