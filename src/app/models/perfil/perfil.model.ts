export interface PerfilModel {
  id?: string;
  documento: string;
  nombres: string;
  apellidos: string;
  iglesia?: string;
  celular?: string;
  nameIglesia?: string;
  email: string;
  rol: string | null;
  postulado?: PostuladoModel;
  casaApoyo?: CasaApoyoModel;
}

export interface AsigmentRolePerfilModel {
  rol: string | null;
  iglesia: string;
}

export interface PostuladoModel {
  casaApoyo: boolean;
  transporte: boolean;
  testigo: boolean;
}

export interface CasaApoyoModel {
  status: boolean;
  casaApoyoId: string;
}
