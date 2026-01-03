export interface CuentavotosModel {
    reportadoPor: string; // documento del testigo que reporta
    puestoVotacion: string;
    mesaVotacion: string;
    senado: number; // votos para senado
    camara: number; // votos para cámara
}
