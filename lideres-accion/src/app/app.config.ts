import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideToastr({ timeOut: 2000, preventDuplicates: true }),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'lida-f59df',
        appId: '1:410795238641:web:d7c476ab836ea7becfb550',
        storageBucket: 'lida-f59df.firebasestorage.app',
        apiKey: 'AIzaSyAIdIAaoUZgpHsBqbl2FIcLVRYGnDYSe0w',
        authDomain: 'lida-f59df.firebaseapp.com',
        messagingSenderId: '410795238641',
        measurementId: 'G-QMPFXEBJFG',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimationsAsync(),
  ],
};
