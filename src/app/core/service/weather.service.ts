import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {WeatherDaily, WeatherData, WeatherHourly} from "../models/weather.model";
import {BehaviorSubject, catchError, map, Observable, of, tap} from "rxjs";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/weather';

  // Novo:
  private favoriteCitiesSubject = new BehaviorSubject<string[]>([]);
  favoriteCities$ = this.favoriteCitiesSubject.asObservable();
  // jos novije
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();


  constructor() {
    // Novo: Inicijalizacija omiljenih gradova iz localStorage
    const storedCities = localStorage.getItem('favoriteCities');
    if (storedCities) {
      this.favoriteCitiesSubject.next(JSON.parse(storedCities));
    }
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }


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
/*
  // Novo: Metoda za dodavanje omiljenog grada
  addFavoriteCity(city: string): void {
    const currentFavorites = this.favoriteCitiesSubject.value;
    if (!currentFavorites.includes(city)) {
      const newFavorites = [...currentFavorites, city];
      this.favoriteCitiesSubject.next(newFavorites);
      localStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
    }
  }

 */
/*
  getFavoriteWeather(): Observable<WeatherData[]> {
    const favorites = this.favoriteCitiesSubject.value;
    return this.http.post<WeatherData[]>(`${this.apiUrl}/favorites`, { cities: favorites }).pipe(
      catchError(this.handleError<WeatherData[]>('getFavoriteWeather', []))
    );
  }
*/
  /*
  // Novo: Metoda za uklanjanje omiljenog grada
  removeFavoriteCity(city: string): void {
    const currentFavorites = this.favoriteCitiesSubject.value;
    const newFavorites = currentFavorites.filter(c => c !== city);
    this.favoriteCitiesSubject.next(newFavorites);
    localStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
  }
*/
  // jos novije




  // Metoda za prijavu korisnika (simulirana)
  login(username: string): void {
    // U pravoj aplikaciji, ovdje biste napravili HTTP poziv za prijavu
    const user: User = { id: 1, username, favoriteCities: [] };
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Metoda za odjavu korisnika
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  // Metoda za dodavanje omiljenog grada za trenutnog korisnika
  addFavoriteCity(city: string): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        favoriteCities: [...currentUser.favoriteCities, city]
      };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Ovdje biste napravili HTTP poziv za ažuriranje korisnika na backendu
    }
  }

  // Metoda za uklanjanje omiljenog grada za trenutnog korisnika
  removeFavoriteCity(city: string): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        favoriteCities: currentUser.favoriteCities.filter(c => c !== city)
      };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Ovdje biste napravili HTTP poziv za ažuriranje korisnika na backendu
    }
  }

  // Metoda za dohvaćanje prognoza za omiljene gradove trenutnog korisnika
  getFavoriteWeather(): Observable<WeatherData[]> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.favoriteCities.length > 0) {
      return this.http.post<WeatherData[]>(`${this.apiUrl}/favorites`, { cities: currentUser.favoriteCities }).pipe(
        catchError(this.handleError<WeatherData[]>('getFavoriteWeather', []))
      );
    }
    return of([]);
  }

  private handleError<T>(operation = 'operation', result?: any) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

}
