export interface PerfilModel  {
  id?: string;
  documento: string;
  nombres: string;
  apellidos: string;
  iglesia?: string;
  nameIglesia?: string;
  email: string;
  rol: string | null;
}

export interface AsigmentRolePerfilModel {
  rol: string | null;
  iglesia: string;
}
