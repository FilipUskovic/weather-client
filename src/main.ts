import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {provideHttpClient} from "@angular/common/http";
import {routes} from "./app/app.routes";
import {provideRouter} from "@angular/router";
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideToastr} from "ngx-toastr";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import 'chart.js';
import {Chart, registerables} from "chart.js";
import {appConfig} from "./app/app.config";

Chart.register(...registerables);

bootstrapApplication(AppComponent,  {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideToastr(), provideAnimationsAsync()
  ]
})
  .catch((err) => console.error(err));
