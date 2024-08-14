import {Component, inject} from '@angular/core';
import {Observable} from "rxjs";
import {FormsModule} from "@angular/forms";
import {AsyncPipe, DecimalPipe, NgIf} from "@angular/common";
import {WeatherService} from "../weather.service";
import {WeatherData} from "./model/weather.model";

@Component({
  selector: 'app-weather-forecast',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgIf,
    DecimalPipe
  ],
  templateUrl: './weather-forecast.component.html',
  styleUrl: './weather-forecast.component.scss'
})
export class WeatherForecastComponent {

  city = "";
  weatherData$: Observable<WeatherData> | undefined;

  private weatherService = inject(WeatherService);

  fetchWeatherData(){
    this.weatherData$ = this.weatherService.getWeather(this.city);
  }

  kelvinToCelsius(tempKelvin: number): number {
    return this.weatherService.kelvinToCelsius(tempKelvin);
  }

}
