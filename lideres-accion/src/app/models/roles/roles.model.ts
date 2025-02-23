export interface RolesModel {
    nombre: string;
    permisos: PermisosModel;
}



export interface PermisosModel {
    asociarRol: boolean;
    crearUsuario: boolean;
    eliminarUsuario: boolean;
    editarUsuario: boolean;
    verRoles: boolean;
    verPermisos: boolean;
    crearSede: boolean;
    eliminarSede: boolean;
    verTodosLosReferidos: boolean;
    asignarReferido: boolean;
    verTodosLosUsuarios: boolean;
}