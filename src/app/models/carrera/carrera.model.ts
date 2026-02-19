
export interface CreateCarreraModel {
    id?: string; // el id se genera automaticamente
    tipoVehiculo: string;
    lugarRecogida: string;
    puestoVotacionIr: { nombre: string, ubicacion: string };
    observaciones: string;
    postulados: PostuladosIdsModel[];
    seleccionadoId?: string | 'Sin seleccionar';
    nombreSolicitante?: string;
    nombreVotante?: string;
    telefonoSolicitante: string;
    telefonoVotante: string;
    latitudSolicitante?: number;
    longitudSolicitante?: number;
    latitudSeleccionado?: number;
    longitudSeleccionado?: number;
    vehiculoIdAprobado?: string;
    datosConductorAprobado?: {
        nombre: string;
        telefono: string;
        foto?: string;
        placaVehiculo: string;
        modeloVehiculo: string;
        colorVehiculo: string;
    };
    estado?: 'Abierto' | 'Cancelada' | 'En ruta' | 'Finalizada';
    creadaPor?: string;  // uid del usuario es decir el id de perfil.model.ts
    horaCreacion: string;
    municipio: string;
}


export interface PostuladosIdsModel {
    id?: string;
    latitud?: number;
    longitud?: number;
}


export interface AsignarCarreraModel {
    id?: string;
    puestoVotacionIr: { nombre: string, ubicacion: string };
    telefonoVotante: string;
    nombreVotante?: string;
    estado: 'En ruta' | 'Finalizada';
    horaCreacion: string;
    municipio: string;
    creadaPor: string;
    vehiculoIdAprobado?: string;
    datosConductorAprobado: {
        nombre: string;
        telefono: string;
        foto?: string;
        placaVehiculo: string;
        modeloVehiculo: string;
        colorVehiculo: string;
    };





}







