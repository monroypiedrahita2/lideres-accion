export interface CasaApoyoModel {
    barrioId: string;
    barrio: string;  //nombre segun el barrioId
    municipio: string; //nombre segun el barrioId
    direccion: string;
    nombreHabitante: string;
    telefonoHabitante: string;
    responsableId?: string;
    responsableNombre?: string;
    iglesiaId?: string | null;
    vehiculos?: VehiculoModelByCasaApoyo[];
}


export interface VehiculoModelByCasaApoyo {
  id?: string;
  tipoVehiculo: string;
  placa: string;
  marca: string;
  modelo: string;
  nombreModelo: string;
  color: string;
  conductorId: string;
  nombre: string;
  apellidos: string;
  celular: string;
  aprobado: boolean;

}
