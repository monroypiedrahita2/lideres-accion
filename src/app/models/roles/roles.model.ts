
export interface RolesModel {
  id: string,
  rol: string;
}
export interface UsuarioModel {
  id: string,
  nombres: string;
  apellidos: string;
  email: string;
  rol?: string;
  iglesia: string;
}


