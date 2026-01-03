export interface VehiculoModel {
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
  iglesiaId?: string | null;
  aprobado: boolean | null;
  casaApoyoId?: string | null;
}
