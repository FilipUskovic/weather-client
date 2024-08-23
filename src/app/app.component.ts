import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WeatherForecastComponent} from "./features/weather/weather-forecast/weather-forecast.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {WeatherDasboardComponent} from "./features/weather/weather-dasboard/weather-dasboard.component";
import {CommonModule} from "@angular/common";
import {WeatherService} from "./core/service/weather.service";
import {catchError, EMPTY} from "rxjs";
import {MatTabsModule} from "@angular/material/tabs";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ChartComponentComponent} from "./chart-component/chart-component.component";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    WeatherForecastComponent,
    WeatherDasboardComponent,
    ChartComponentComponent,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTabsModule,
    FormsModule, ChartComponentComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'weather-app';
  weatherService = inject(WeatherService);

  ngOnInit() {
    this.checkAuthentication();
  }

  private checkAuthentication() {
    const token = this.weatherService.getToken();
    if (token) {
      this.weatherService.getCurrentUser().pipe(
        catchError(error => {
          console.error('Authentication failed:', error);
          this.weatherService.logout();
          return EMPTY;
        })
      ).subscribe(user => {
        if (user) {
          console.log('User authenticated:', user);
          //this.weatherService.getCurrentUser();
        }
      });
    }
  }

}
