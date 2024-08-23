import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {ErrorInterceptor} from "./interceptors/error.interceptor";
import {BrowserAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import {MatSnackBarModule} from "@angular/material/snack-bar";


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideAnimations(), importProvidersFrom(
      BrowserAnimationsModule,
    MatSnackBarModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
      })
    )
  ]
};
