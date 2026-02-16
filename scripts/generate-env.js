const fs = require('fs');
const path = require('path');

function parseDotEnv(src) {
  return src.split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) return acc;
    let val = m[2] || '';
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    acc[m[1]] = val;
    return acc;
  }, {});
}

function getEnvVars(fromEnv) {
  return {
    apiKey: fromEnv.NG_APP_FIREBASE_API_KEY || '',
    authDomain: fromEnv.NG_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: fromEnv.NG_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: fromEnv.NG_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: fromEnv.NG_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: fromEnv.NG_APP_FIREBASE_APP_ID || '',
    measurementId: fromEnv.NG_APP_FIREBASE_MEASUREMENT_ID || '',
  };
}

function writeEnvironmentFile(targetPath, production, envVars) {
  const content = `export const environment = {
  production: ${production},
  firebase: {
    apiKey: '${envVars.apiKey}',
    authDomain: '${envVars.authDomain}',
    projectId: '${envVars.projectId}',
    storageBucket: '${envVars.storageBucket}',
    messagingSenderId: '${envVars.messagingSenderId}',
    appId: '${envVars.appId}',
    measurementId: '${envVars.measurementId}',
  },
  collections: {
    comunas: 'Comunas',
    referidos: 'Referidos',
    iglesias: 'Iglesias',
    roles: 'Roles',
    lideres: 'Lideres',
    barrios: 'Barrios',
    perfil: 'Perfiles',
    vehiculos: 'Vehiculos',
    casasApoyo: 'Casas',
    coordinadorTestigos: 'CoordinadorTestigos',
    testigosAsociados: 'TestigosAsociados',
    puestosVotacion: 'PuestosVotacion',
    cuentavotos: 'Cuentavotos',
    carreras: 'Carreras',
  },
  alerts: { timeOut: 3000, preventDuplicates: true },
};
`;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
  console.log('Wrote', targetPath);
}

function main() {
  const mode = process.argv[2] || 'local';
  const repoRoot = path.join(__dirname, '..');
  const envFile = path.join(repoRoot, '.env');
  const fileEnv = fs.existsSync(envFile) ? parseDotEnv(fs.readFileSync(envFile, 'utf8')) : {};
  const combined = Object.assign({}, process.env, fileEnv);

  if (mode === 'prod' || mode === 'production') {
    const vars = getEnvVars(combined);
    const target = path.join(repoRoot, 'src', 'environments', 'environment.prod.ts');
    writeEnvironmentFile(target, true, vars);
    process.exit(0);
  }

  // local by default
  const vars = getEnvVars(combined);
  const target = path.join(repoRoot, 'src', 'environments', 'environment.ts');
  writeEnvironmentFile(target, false, vars);
}

main();
