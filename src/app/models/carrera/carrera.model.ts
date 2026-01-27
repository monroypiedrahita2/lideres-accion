
export interface CreateCarreraModel {
    id?: string; // el id se genera automaticamente
    casa: CasaApoyoCarreraModel;
    cantidadPersonas: number;
    tipoVehiculo: string;
    hora?: string;
    vehiculoIdAprobado?: string;
    lugarRecogida: string;
    puestoVotacion: string;
    observaciones: string;
    postulados?: string[];
    telefono: string;
    tiempoRecogida: string;
    latitud?: number;
    longitud?: number;

}


export interface CasaApoyoCarreraModel {
    barrioId: string;
    barrio: string;  //nombre segun el barrioId
    municipio: string; //nombre segun el barrioId
    direccion: string;
    responsableId: string;
    responsableNombre: string;
    responsableApellido: string;
    responsableTelefono: string;
}





