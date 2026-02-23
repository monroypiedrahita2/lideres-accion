
export const TITULOS_EXCEL: string[] = [
  '¿REFERIDO INTERNO?',
  'DOCUMENTO',
  'NOMBRES',
  'APELLIDOS',
  'CELULAR',
  'EMAIL',
  'EMPRENDEDOR',
  'COMUNA',
  'BARRIO',
  'DIRECCION',
  'FECHA DE NACIMIENTO',
  'LUGAR DE VOTACION',
  'MESA DE VOTACION',
  'SENADO',
  'CAMARA',
  'REFERIDO POR (CEDULA)',
];

export const TITULOS_DESCARGA: string[] = [
  ...TITULOS_EXCEL,
  'NOMRE REFERENTE'
]

export const DESCRIPCION_EXCEL: string[] = [
  '(Interno/Externo)',
  'Número de documento del referido (cedula, sin puntos ni comas)',
  'Nombres del referido',
  'Apellidos del referido',
  'Celular del referido',
  'Email del referido',
  'Indica si el referido es emprendedor (SI/NO)',
  'Comuna donde reside el referido',
  'Barrio donde reside el referido',
  'Dirección del referido',
  'formato (1991-09-10) (AAAA-MM-DD)',
  'Lugar de votación del referido',
  'Mesa de votación del referido',
  'Apoyará con el voto por SENADO (SI/NO)',
  'Apoyará con el voto por CAMARA (SI/NO)',
  'Referido por (Cédula de la persona que refiere)',
];

export const TITULOS_EXCEL_COMUNAS: string[] = [
  'DEPARTAMENTO',
  'MUNICIPIO',
  'COMUNA',
  'BARRIO',
];

export const DESCRIPCION_EXCEL_COMUNAS: string[] = [
  'Nombre del departamento (ej: Antioquia)',
  'Nombre del municipio (ej: Medellín)',
  'Nombre o número de la comuna',
  'Nombre del barrio',
];

export const TITULOS_EXCEL_PUESTOS: string[] = [
  'NOMBRE PUESTO',
  'MESAS TOTALES',
  'UBICACION',
];

export const DESCRIPCION_EXCEL_PUESTOS: string[] = [
  'Nombre completo del puesto de votación',
  'Número total de mesas en el puesto',
  'Dirección o ubicación del puesto',
];

