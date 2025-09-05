import { RolesModel } from "../../../models/roles/roles.model";

export const LIST_ROLES: RolesModel[] = [
  { nombre: 'Super usuario', nivel: 100 },
  { nombre: 'Coordinador nacional', nivel: 90 },
  { nombre: 'Coordinador departamental', nivel: 80 },
  { nombre: 'Coordinador de municipio', nivel: 70 },
  { nombre: 'Pastor', nivel: 60 },
  { nombre: 'coordinador de iglesia', nivel: 50 },
  { nombre: 'Líder', nivel: 40 },
  { nombre: 'Referido', nivel: 30 },
]
