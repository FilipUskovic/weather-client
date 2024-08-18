import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WeatherForecastComponent} from "./features/weather/weather-forecast/weather-forecast.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {WeatherDasboardComponent} from "./features/weather/weather-dasboard/weather-dasboard.component";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    WeatherForecastComponent,
    WeatherDasboardComponent,
    CommonModule,
    //BrowserModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weather-app';
}
