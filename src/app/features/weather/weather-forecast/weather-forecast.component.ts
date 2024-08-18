import {Component, computed, effect, inject, signal} from '@angular/core';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of, startWith,

} from "rxjs";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {CitySerachComponent} from "../../city/city-serach/city-serach.component";
import {WeatherService} from "../../../core/service/weather.service";
import {WeatherDaily, WeatherData, WeatherHourly} from "../../../core/models/weather.model";
import {User} from "../../user/model/user.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


@Component({
  selector: 'app-weather-forecast',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgIf,
    DecimalPipe,
    CitySerachComponent,
    NgForOf,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './weather-forecast.component.html',
  styleUrl: './weather-forecast.component.scss'
})
export class WeatherForecastComponent {
  private weatherService = inject(WeatherService);
  cityInput = new FormControl('');

  // Define Signals
  city = signal<string | null>(null);
  currentWeather = signal<WeatherData | null>(null);
  hourlyWeather = signal<WeatherHourly | null>(null);
  dailyWeather = signal<WeatherDaily | null>(null);
  loadingCurrent = signal(false);
  loadingHourly = signal(false);
  loadingDaily = signal(false);
  error = signal<string | null>(null);


  favoriteCities = signal<string[]>([]);
  favoriteWeather = signal<WeatherData[]>([]);


  isValidCity = computed(() => this.city()!.trim().length > 0);
  //jos novije
  loading = signal(false);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser())


  constructor() {

    // novije
    this.weatherService.currentUser$.pipe(takeUntilDestroyed()).subscribe(
      user => this.currentUser.set(user)
    );

    // Setup listener for city input changes with effect
    effect(() => {
      const currentCity = this.city();
      if (this.isValidCity()) {
        this.fetchWeatherData(currentCity!);
      } else {
        this.resetWeatherData();
      }
    }, { allowSignalWrites: true }); // Allow writing to signals within this effect

    // Subscribe to favorite cities changes
    this.weatherService.favoriteCities$.subscribe(cities => {
      this.favoriteCities.set(cities);
      this.fetchFavoriteWeather();
    });

    this.cityInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(city => {
      this.city.set(city || ''); // Postavljamo prazan string ako je city null ili undefined
    });
      //.subscribe(city => this.city.set(city));


    // jos novije
    this.cityInput.valueChanges.pipe(takeUntilDestroyed()).subscribe(
      city => this.city.set(city || '')
    );
  }

  login(username: string): void {
    this.weatherService.login(username);
  }

  logout(): void {
    this.weatherService.logout();
  }

  addToFavorites(): void {
    const currentCity = this.city();
    if (currentCity && this.isLoggedIn()) {
      this.weatherService.addFavoriteCity(currentCity);
      this.fetchFavoriteWeather();
    }
  }

  removeFromFavorites(city: string): void {
    if (this.isLoggedIn()) {
      this.weatherService.removeFavoriteCity(city);
      this.fetchFavoriteWeather();
    }
  }

  fetchFavoriteWeather(): void {
    if (this.isLoggedIn()) {
      this.loading.set(true);
      this.weatherService.getFavoriteWeather().subscribe({
        next: (weather) => {
          this.favoriteWeather.set(weather);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error fetching favorite weather:', err);
          this.error.set('Failed to fetch favorite weather');
          this.loading.set(false);
        }
      });
    }
  }

   fetchWeatherDataFav(city: string): void {
    this.loading.set(true);
    this.weatherService.getCurrentWeather(city).subscribe({
      next: (weather) => {
        this.currentWeather.set(weather);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching weather:', err);
        this.error.set('Failed to fetch weather data');
        this.loading.set(false);
      }
    });
  }


  /*
    addToFavorites(city: string) {
      if (this.isValidCity()) {
        this.weatherService.addFavoriteCity(this.city()!);
      }
    }

    removeFromFavorites(city: string) {
      this.weatherService.removeFavoriteCity(city);
    }

    fetchFavoriteWeather() {
      this.weatherService.getFavoriteWeather().subscribe(
        weather => this.favoriteWeather.set(weather),
        error => console.error('Error fetching favorite weather:', error)
      );
    }


   */
  private fetchWeatherData(city: string) {
    // Reset loading and error states
    this.loadingCurrent.set(true);
    this.loadingHourly.set(true);
    this.loadingDaily.set(true);
    this.error.set(null);

    combineLatest({
      current: this.weatherService.getCurrentWeather(city).pipe(startWith(null)),
      hourly: this.weatherService.getHourlyWeather(city).pipe(startWith(null)),
      daily: this.weatherService.getDailyWeather(city).pipe(startWith(null))
    }).pipe(
      catchError(error => {
        console.error('Error fetching weather data:', error);
        this.error.set('Failed to fetch weather data');
        return of({ current: null, hourly: null, daily: null });
      })
    ).subscribe(({ current, hourly,daily }) => {
      if (current) {
        this.currentWeather.set(current);
        this.loadingCurrent.set(false);
      } else {
        this.currentWeather.set(null);
        this.loadingCurrent.set(false);
      }

      if (hourly) {
        this.hourlyWeather.set(hourly);
        this.loadingHourly.set(false);
      } else {
        this.hourlyWeather.set(null);
        this.loadingHourly.set(false);
      }
      if (daily) {
         this.dailyWeather.set(daily);
        this.loadingDaily.set(false);
      } else {
        this.dailyWeather.set(null);
        this.loadingDaily.set(false);
      }
    });
  }

  private resetWeatherData() {
    this.currentWeather.set(null);
    this.hourlyWeather.set(null);
    this.dailyWeather.set(null);
    this.loadingCurrent.set(false);
    this.loadingHourly.set(false);
    this.loadingDaily.set(false);
    this.error.set(null);
  }

  // Track by index function for *ngFor
  trackByIndex(index: number): number {
    return index;
  }
  /*
  private weatherService = inject(WeatherService);

  cityInput = new FormControl('');

  city = toSignal(this.cityInput.valueChanges.pipe(
    debounceTime(300), // Smanjeno na 300ms za bolju responsivnost
    distinctUntilChanged()
  ), { initialValue: '' });

  private weatherData$ = toObservable(this.city).pipe(
    switchMap(city => {
      if (!city) return EMPTY;
      return combineLatest({
        current: this.weatherService.getCurrentWeather(city).pipe(startWith(null)),
        hourly: this.weatherService.getHourlyWeather(city).pipe(startWith(null))
      }).pipe(
        map(({ current, hourly }) => ({ current, hourly, loading: false, error: null })),
        startWith({ current: null, hourly: null, loading: true, error: null }),
        catchError(error => {
          console.error('Error fetching weather data:', error);
          return [{ current: null, hourly: null, loading: false, error: 'Failed to fetch weather data' }];
        })
      );
    })
  );

  weatherData = toSignal(this.weatherData$, {
    initialValue: { current: null, hourly: null, loading: false, error: null }
  });

  currentWeather = computed(() => this.weatherData().current);
  hourlyWeather = computed(() => this.weatherData().hourly);
  loading = computed(() => this.weatherData().loading);
  error = computed(() => this.weatherData().error);

  weatherStatus = computed(() => {
    if (this.loading()) return 'loading';
    if (this.error()) return 'error';
    if (this.currentWeather() || this.hourlyWeather()) return 'success';
    return 'idle';
  });

  constructor() {
    effect(() => {
      console.log('City changed:', this.city());
      console.log('Weather data:', this.weatherData());
    });
  }

  /*
  private weatherService = inject(WeatherService);

  cityInput = new FormControl('');

  city = toSignal(this.cityInput.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged()
  ), { initialValue: '' });

  private currentWeather$ = toObservable(this.city).pipe(
    switchMap(city => city ? this.weatherService.getCurrentWeather(city) : of(null)),
    catchError(error => {
      console.error('Error fetching current weather', error);
      return of(null);
    })
  );

  private hourlyWeather$ = toObservable(this.city).pipe(
    switchMap(city => {
      if (!city) return of(null);
      console.log('Fetching hourly weather for:', city);
      return this.weatherService.getHourlyWeather(city).pipe(
        tap(data => console.log('Hourly weather data:', data)),
        catchError(error => {
          console.error('Error fetching hourly weather:', error);
          return of(null);
        })
      );
    })
  );
  currentWeather = toSignal<WeatherData | null>(this.currentWeather$, { initialValue: null });
  hourlyWeather = toSignal<WeatherHourly | null>(this.hourlyWeather$, { initialValue: null });

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  weatherStatus = computed(() => {
    if (this.loading()) return 'loading';
    if (this.error()) return 'error';
    if (this.currentWeather() || this.hourlyWeather()) return 'success';
    return 'idle';
  });

  constructor() {
    effect(() => {
      console.log('City changed:', this.city());
      console.log('Current weather:', this.currentWeather());
      console.log('Hourly weather:', this.hourlyWeather());
    });
  }
   */
}
