import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {WeatherDaily, WeatherData, WeatherHourly} from "../models/weather.model";
import {BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError} from "rxjs";
import {User} from "../models/user.model";
import {environment} from "../../shared/enviroment";
import {AuthenticationResponse, LoginResponse} from "../models/authenticationresponse.model";

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = environment;
  private authUrl = `${this.apiUrl}/auth`;
  private weatherUrl = `${this.apiUrl}/weather`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private favoriteCitiesSubject = new BehaviorSubject<string[]>([]);
  favoriteCities$ = this.favoriteCitiesSubject.asObservable();

  private jwtToken: string | null = null;

  setToken(token: string) {
    this.jwtToken = token.trim();
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return this.jwtToken || localStorage.getItem('jwtToken');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}` // Dodajte .trim() da uklonite eventualne razmake
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<AuthenticationResponse>(`${this.authUrl}/register`, {username, email, password}).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token.trim());
        }
      }),
      switchMap(() => this.getCurrentUser()),
      catchError(this.handleError<User>('register'))
    );
  }


  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.setToken(response.token);
      }),
      catchError(this.handleError<LoginResponse>('login'))
    );
  }


  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.authUrl}/current-user`, {headers: this.getHeaders()}).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.favoriteCitiesSubject.next(user.favoriteCities || []);
      }),
      catchError(this.handleError<User>('getCurrentUser'))
    );
  }


  logout(): Observable<void> {
    console.log('Attempting to logout');
    return this.http.post<void>(`${this.authUrl}/logout`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => {
        console.log('Logout successful');
        this.clearUserData();
      }),
      catchError((error) => {
        console.error('Logout failed:', error);
        // Even if the server request fails, we still want to clear local data
        this.clearUserData();
        return throwError(() => new Error(`Logout failed: ${error.message}`));
      })
    );
  }

  private clearUserData(): void {
    this.currentUserSubject.next(null);
    this.favoriteCitiesSubject.next([]);
    this.jwtToken = null;
    localStorage.removeItem('jwtToken');
  }



  getFavoriteCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.weatherUrl}/favorites`, {headers: this.getHeaders()}).pipe(
      tap(cities => this.favoriteCitiesSubject.next(cities)),
      catchError(this.handleError<string[]>('getFavoriteCities', []))
    );
  }

  addFavoriteCity(cityName: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.weatherUrl}/favorites`, { cityName }, { headers: this.getHeaders() }).pipe(
      tap(favoriteCities => {
        this.favoriteCitiesSubject.next(favoriteCities);
      }),
      catchError(this.handleError<string[]>('addFavoriteCity'))
    );
  }

  removeFavoriteCity(city: string): Observable<string[]> {
    return this.http.delete<string[]>(`${this.weatherUrl}/favorites/${city}`, { headers: this.getHeaders() }).pipe(
      tap(cities => this.favoriteCitiesSubject.next(cities)),
      catchError(this.handleError<string[]>('removeFavoriteCity', []))
    );
  }

  getCurrentWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.weatherUrl}/current/${city}`).pipe(
      catchError(this.handleError<WeatherData>('getCurrentWeather'))
    );
  }

  getHourlyWeather(city: string): Observable<WeatherHourly> {
    return this.http.get<WeatherHourly[]>(`${this.weatherUrl}/hourly/${city}`).pipe(
      map(response => this.mapHourlyWeather(response)),
      catchError(this.handleError<WeatherHourly>('getHourlyWeather'))
    );
  }

  private mapHourlyWeather(data: any[]): WeatherHourly {
    return {
      time: data.map(item => {
        const [year, month, day, hour, minute] = item.dateTime;
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toISOString(); // Or any other string format you prefer
      }),
      temperature2m: data.map(item => item.temperature),
      description: data.map(item => item.description),
      feelsLike: data.map(item => item.feelsLike), // Fallback to temperature
      relativeHumidity2m: data.map(item => item.humidity),
      windspeed10m: data.map(item => item.windSpeed),
      pressureMsl: data.map(item => item.pressure),
      visibility: data.map(item => item.visibility),
      uvIndex: data.map(item => item.uvIndex)
    };
  }


  getDailyWeather(city: string): Observable<WeatherDaily> {
    return this.http.get<WeatherDaily[]>(`${this.weatherUrl}/daily/${city}`).pipe(
      //  retry(1),
      map(response => this.mapToDaily(response)),
      catchError(this.handleError<WeatherDaily>('getDailyWeather'))
    );
  }

  private mapToDaily(data: any[]): WeatherDaily {
    return {
      time: data.map(item => {
        const [year, month, day, hour, minute] = item.dateTime;
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toISOString(); // Or any other string format you prefer
      }),
      temperatureMax: data.map(item => item.temperatureMax),
      temperatureMin: data.map(item => item.temperatureMin),
      description: data.map(item => item.description),
      uvIndex: data.map(item => item.uvIndex),
      feelsLikeMax: data.map(item => item.feelsLikeMax),
      humidity: data.map(item => item.humidity),
      windSpeed: data.map(item => item.windSpeed),
    };
  }


  private handleError<T>(operation = 'operation', _result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      console.error('Error details:', error.error);
      console.error('Error status:', error.status);
      console.error('Error headers:', error.headers);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }

}

  /*
  getHistoricalData(city: string, startDate: string, endDate: string): Observable<HistoricalData> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<HistoricalData>(`${this.weatherUrl}/historical/${city}`, { params }).pipe(
      catchError(this.handleError<HistoricalData>('getHistoricalData'))
    );
  }




  getWeatherTrends(city: string): Observable<WeatherTrends> {
    return this.http.get<WeatherTrends>(`${this.weatherUrl}/trends/${city}`).pipe(
      catchError(this.handleError<WeatherTrends>('getWeatherTrends'))
    );
  }

   */
