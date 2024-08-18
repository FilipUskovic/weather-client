import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {WeatherDaily, WeatherData, WeatherHourly} from "../models/weather.model";
import {catchError, map, Observable, of, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/weather';

  getCurrentWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/current/${city}`).pipe(
      tap(data => console.log('Current Weather:', data)),
      catchError(this.handleError<WeatherData>('getCurrentWeather'))
    );
  }

  getHourlyWeather(city: string): Observable<WeatherHourly | null> {
    return this.http.get<WeatherHourly[]>(`${this.apiUrl}/hourly/${city}`).pipe(
      tap(response => console.log('Raw hourly weather response:', response)),
      map(response => this.mapHourlyWeather(response)),
      tap(mappedData => console.log('Mapped hourly weather data:', mappedData)),
      catchError(this.handleError<WeatherHourly>('getHourlyWeather', null))
    );
  }

  getDailyWeather(city: string){
    return this.http.get<WeatherDaily[]>(`${this.apiUrl}/daily/${city}`).pipe(
      tap(response => console.log('Raw daily weather response:', response)),
      map(response => this.mapToDaily(response)),
      tap(mappedData => console.log('Mapped daily weather data:', mappedData)),
      catchError(this.handleError<WeatherDaily>('getHourlyWeather', null))
    )
  }

  private mapHourlyWeather(data: any[]): WeatherHourly {
    return {
      time: data.map(item => item.dateTime),
      temperature2m: data.map(item => item.temperature),
      description: data.map(item => item.description),
      apparentTemperature: data.map(item => item.feelsLikeTemperature),
      relativeHumidity2m: data.map(item => item.humidity),
      windspeed10m: data.map(item => item.windSpeed),
      pressureMsl: data.map(item => item.pressure),
      visibility: data.map(item => item.visibility),
      uvIndex: data.map(item => item.uvIndex)
    };
  }
  private mapToDaily(data: any[]): WeatherDaily{
    return {
      time: data.map(item => item.dateTime),
      temperature: data.map(item => item.temperature),
      description: data.map(item => item.description),
      uvIndex: data.map(item => item.uvIndex),
      windSpeed: data.map(item => item.windSpeed),
      feelsLikeTemperature: data.map(item => item.feelsLikeTemperature),
      humidity: data.map(item => item.humidity)
    };
  }

  private handleError<T>(operation = 'operation', result?: any) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

}
