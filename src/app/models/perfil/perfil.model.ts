export interface PerfilModel  {
  id?: string;
  documento: string;
  nombres: string;
  apellidos: string;
  iglesia?: string;
  email: string;
  rol: string | null;
}

export interface AsigmentRolePerfilModel {
  rol: string | null;
  iglesia: string;
}
