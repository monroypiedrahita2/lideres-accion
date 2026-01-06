export interface CreateCarreraModel {
    id?: string; // el id se genera automaticamente
    casaApoyoId: string;
    cantidadPersonas: number;
    tipoVehiculo: string;
    hora?: string;
    vehiculoIdAprobado?: string;
    lugarRecogida: string;
    puestoVotacion: string;
    observaciones: string;
    postulados?: string[];
    telefonoInformacion: string;
    tiempoRecogida: string;
}


