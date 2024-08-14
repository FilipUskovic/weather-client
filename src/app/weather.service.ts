import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WeatherData} from "./weather-forecast/model/weather.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/weather/current';

  constructor() { }

  getWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/${city}`);
  }

  kelvinToCelsius(tempKelvin: number): number {
    return tempKelvin - 273.15;
  }

}
