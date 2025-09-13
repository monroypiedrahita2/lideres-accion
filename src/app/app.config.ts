import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { environment } from '../enviroments';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideToastr(environment.alerts),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp(environment.production ? environment.firebasePDN : environment.firebaseDev)
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimationsAsync(),
  ],
};
