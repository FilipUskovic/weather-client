import {Component, inject} from '@angular/core';
import {WeatherService} from "../../../core/service/weather.service";
import {UserService} from "../../../core/service/user-service.service";
import {CitySerachComponent} from "../../city/city-serach/city-serach.component";
import {WeatherForecastComponent} from "../weather-forecast/weather-forecast.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {FavoriteCityComponent} from "../../city/favorite-city/favorite-city.component";

@Component({
  selector: 'app-weather-dasboard',
  standalone: true,
  imports: [
    CitySerachComponent,
    WeatherForecastComponent,
    AsyncPipe,
    FavoriteCityComponent,
    NgIf
  ],
  templateUrl: './weather-dasboard.component.html',
  styleUrl: './weather-dasboard.component.scss'
})
export class WeatherDasboardComponent{
  private weatherService = inject(WeatherService);
  private userService = inject(UserService);
/*
  private selectedCity = signal<string>('');
  private username = 'currentUser';

  private favoriteCitiesSubject = new BehaviorSubject<string[]>([]);
  favoriteCities$ = this.favoriteCitiesSubject.asObservable();

  private selectedCity$ = toObservable(this.selectedCity);

  private currentWeather$ = this.selectedCity$.pipe(
    switchMap(city => city ? this.weatherService.getWeatherCurrent(city) : of(null)),
    catchError(err => {
      this.error.set(`Error fetching current weather: ${err.message}`);
      return of(null);
    })
  );

  private hourlyForecasts$ = this.selectedCity$.pipe(
    switchMap(city => city ? this.weatherService.getHourlyForecast(city) : of(null)),
    catchError(err => {
      this.error.set(`Error fetching hourly forecast: ${err.message}`);
      return of(null);
    })
  );

  currentWeather = toSignal(this.currentWeather$, { initialValue: null });
  hourlyForecasts = toSignal(this.hourlyForecasts$, { initialValue: null });
  error = signal<string | null>(null);

  constructor() {
    this.loadFavoriteCities();

    effect(() => {
      console.log('Selected city changed:', this.selectedCity());
    });
  }

  setSelectedCity(city: string) {
    this.selectedCity.set(city);
    this.error.set(null);
  }

  loadFavoriteCities() {
    this.userService.getFavoriteCities(this.username).pipe(
      map(users => users.flatMap(user => user.favoriteCities)),
      catchError(err => {
        this.error.set(`Error loading favorite cities: ${err.message}`);
        return of([]);
      })
    ).subscribe(cities => {
      this.favoriteCitiesSubject.next(cities);
    });
  }

  addFavoriteCity(city: string) {
    this.userService.addFavoriteCity(this.username, city).pipe(
      catchError(err => {
        this.error.set(`Error adding favorite city: ${err.message}`);
        return of(null);
      })
    ).subscribe(() => {
      this.loadFavoriteCities();
    });
  }

  removeFavoriteCity(city: string) {
    this.userService.removeFavoriteCity(this.username, city).pipe(
      catchError(err => {
        this.error.set(`Error removing favorite city: ${err.message}`);
        return of(null);
      })
    ).subscribe(() => {
      this.loadFavoriteCities();
    });
  }

 */
}
