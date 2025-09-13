import { CardModel } from '../../../models/utils/card.model';

export const CARDS_HOME: CardModel[] = [
  // {
  //   goTo: '../mi-perfil',
  //   title: 'Mi perfil',
  //   description: 'Ver y editar tu perfil',
  //   icon: 'person'
  // },
  {
    goTo: '../control-accesos',
    title: 'Control y accesos',
    description: 'Gestionar el control y los accesos',
    icon: 'lock',
    showIf: ['Pastor', 'Super usuario'],
  },
  {
    goTo: '../crear-iglesia',
    title: 'Iglesia',
    description: 'Ver y gestionar iglesias',
    icon: 'favorite',
    showIf: ['Super usuario'],
  },
  {
    goTo: '../crear-comuna',
    title: 'Comunas',
    description: 'Ver y gestionar comunas',
    icon: 'location_city',
    showIf: ['Todos'],
  },
  // {
  //   goTo: '../roles',
  //   title: 'Roles',
  //   description: 'Administrar roles',
  //   icon: 'supervisor_account'
  // },
  {
    goTo: '../listar-referidos',
    title: 'Listar refereidos',
    description: 'Administrar de referidos',
    icon: 'groups',
    showIf: ['Todos'],
  },
  {
    goTo: '../masivo-referidos',
    title: 'Carga masiva',
    description: 'A través de un archivo Excel',
    icon: 'upload_file',
    showIf: ['Todos'],
  },
  // {
  //   goTo: '../crear-lider',
  //   title: 'Crear líder',
  //   description: 'Crear líderes',
  //   icon: 'person_add'
  // }
];
