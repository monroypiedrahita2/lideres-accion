export interface TestigoModel {
    nombre: string;
    apellido: string;
    iglesiaId: string;
    celular: string;
    puestodevotacion: string;
    mesadevotacion: string;
    foto?: string | null; // foto se toma de authService de foto       
}