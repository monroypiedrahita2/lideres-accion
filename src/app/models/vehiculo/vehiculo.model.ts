import { IglesiaModel } from "../iglesia/iglesia.model";

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
  iglesia: IglesiaModel | null;
  aprobado: boolean | null;
  casaApoyoId?: string | null;
  estado?: 'Activo' | 'Inactivo' | 'En carrera';
  aprobadoPor: string | null; //email de quien aprobo con authService
  foto?: string | null; // foto se toma de authService de foto       
  ubicacionActual?: ubicacionModel | null;

}

export interface ubicacionModel {
    lat: number;
    lng: number;
}

