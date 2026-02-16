PARA PDN
.firebaserc
{
  "projects": {
    "default": "lida-f59df"
  }
}

enviroments 
production: true


PARA DEV

{
  "projects": {
    "default": "lida-dev-f9291"
  }
}

enviroments 
production: false


HOST PDN

ng build --configuration production

https://lida-f59df.web.app/public/login


HOST DEV

https://lida-dev-f9291.web.app/public/login


  // { label: 'Super usuario', value: 'Super usuario', nivel: 100 },
  // { label: 'Coordinador nacional', value: 'Coordinador nacional', nivel: 90 },
  // { label: 'Coordinador departamental', value: 'Coordinador departamental', nivel: 80 },
  // { label: 'Coordinador de municipio', value: 'Coordinador de municipio', nivel: 70 },
  // { label: 'Pastor', value: 'Pastor', nivel: 60 },





Para salir DEV


Comando para hacer el PWA 

ng add @angular/pwa

## Environment variables and deployment

Local development uses a `.env` file to provide Firebase keys. Create a `.env` at the project root (do NOT commit it). An example is provided in `.env.example`.

To generate `src/environments/environment.ts` from your local `.env` run:

```bash
npm run generate:env:local
```

For CI / GitHub Actions deployment, add the following repository secrets (example names used in workflow):

- `FIREBASE_API_KEY_PROD`
- `FIREBASE_AUTH_DOMAIN_PROD`
- `FIREBASE_PROJECT_ID_PROD`
- `FIREBASE_STORAGE_BUCKET_PROD`
- `FIREBASE_MESSAGING_SENDER_ID_PROD`
- `FIREBASE_APP_ID_PROD`
- `FIREBASE_MEASUREMENT_ID_PROD`

The workflow will generate `src/environments/environment.prod.ts` from these secrets before building.

If you need to test the same generation logic locally, you can run:

```bash
npm run generate:env:prod
```

Make sure `.env` is listed in `.gitignore` to avoid accidentally committing secrets.

### Development (non-main) CI secrets

For deployments from branches other than `main` the workflow expects development secrets with these names (set them in the repository Secrets):

- `FIREBASE_API_KEY_DEV`
- `FIREBASE_AUTH_DOMAIN_DEV`
- `FIREBASE_PROJECT_ID_DEV`
- `FIREBASE_STORAGE_BUCKET_DEV`
- `FIREBASE_MESSAGING_SENDER_ID_DEV`
- `FIREBASE_APP_ID_DEV`
- `FIREBASE_MEASUREMENT_ID_DEV`
- `FIREBASE_SERVICE_ACCOUNT_DEV` (service account JSON)

The CI will validate these secrets before attempting the build/deploy for non-main branches.

## Local environment variables (NG_APP_...)

For local development the project reads Firebase keys from `process.env` or a local `.env` file and generates `src/environments/environment.ts` with `npm run generate:env:local`.

Add a `.env` file at the project root with the following variables (names must match):

```env
NG_APP_FIREBASE_API_KEY=your_api_key_here
NG_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NG_APP_FIREBASE_PROJECT_ID=your_project_id
NG_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NG_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NG_APP_FIREBASE_APP_ID=your_app_id
NG_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Then run:

```bash
npm run generate:env:local
```

This will create or overwrite `src/environments/environment.ts` with the values from your `.env` or environment variables. Keep `.env` out of version control (it's listed in `.gitignore`).

If you want to test production generation locally (for example before pushing), set the variables in your environment or `.env` and run:

```bash
npm run generate:env:prod
```



