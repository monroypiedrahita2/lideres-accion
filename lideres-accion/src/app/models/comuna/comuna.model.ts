export interface ComunaModel {
    nombre: string;
    municipio_id: number;
    responsable: ResponsableModel
    barrios: string[];
}

export interface ResponsableModel {
    uid: string;
    nombre: string;
    telefono: string;
}