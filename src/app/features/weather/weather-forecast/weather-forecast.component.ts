import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  catchError, EMPTY,
  finalize, forkJoin, Subject, takeUntil

} from "rxjs";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, DatePipe, DecimalPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {WeatherService} from "../../../core/service/weather.service";
import {WeatherDaily, WeatherData, WeatherHourly} from "../../../core/models/weather.model";
import {User} from "../../../core/models/user.model";
import {ToastService} from "../../../core/service/toast-service";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatList, MatListItem, MatListItemIcon, MatListItemTitle} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressBar} from "@angular/material/progress-bar";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import {animate, style, transition, trigger} from "@angular/animations";

import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef, MatTable,


} from "@angular/material/table";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle} from "@angular/material/expansion";
import {WeatherDasboardComponent} from "../weather-dasboard/weather-dasboard.component";
import {WeatherAlertService} from "../../../core/service/weather-alert.service";



@Component({
  selector: 'app-weather-forecast',
  standalone: true,
  imports: [
    MatExpansionModule,
    FormsModule,
    AsyncPipe,
    NgIf,
    DecimalPipe,
    NgForOf,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatFormField,
    MatInput,
    MatProgressSpinner,
    MatTabGroup,
    MatTab,
    MatList,
    MatListItem,
    MatIconButton,
    MatIcon,
    MatCardTitle,
    MatTooltip,
    NgOptimizedImage,
    MatError,
    MatProgressBar,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTabsModule,
    MatHeaderCell,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatHeaderCellDef,
    MatColumnDef,
    MatTable,
    MatSelect,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatCell,
    MatOption,
    MatCellDef,
    MatListItemIcon,
    MatListItemTitle,
    WeatherDasboardComponent

  ],
  templateUrl: './weather-forecast.component.html',
  styleUrl: './weather-forecast.component.scss',

  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],


})
export class WeatherForecastComponent implements OnInit, OnDestroy{
  private weatherService = inject(WeatherService);
  private toastService = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  //socets
  private weatherAlertWebSocketService = inject(WeatherAlertService);
  private unsubscribe$ = new Subject<void>();





  weatherForm: FormGroup;
  registerForm: FormGroup;
  loginForm: FormGroup;

  compareControl = new FormControl([]);
  comparisonResult: WeatherData[] = [];
  searchForm: FormGroup;
  alertMessages: string[] = [];


  currentWeather: WeatherData | null = null;
  hourlyWeather: WeatherHourly | null = null;
  dailyWeather: WeatherDaily | null = null;
  favoriteWeather: WeatherData[] = [];
  loading = false;
  weatherError: string | null = null;

  currentUser: User | null = null;
  favoriteCities: string[] = [];



  constructor(private fb: FormBuilder) {
    this.weatherForm = this.formBuilder.group({
      cityInput: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.searchForm = this.fb.group({
      city: new FormControl('', [Validators.required])
    });


    this.weatherService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadFavoriteCities();
      } else {
        this.favoriteCities = [];
        this.favoriteWeather = [];
      }
    });

    this.weatherService.favoriteCities$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(cities => {
      this.favoriteCities = cities;
      this.fetchFavoriteWeather();
    });

  }

  ngOnInit() {
    // Pretplata na promjene korisnika
    this.weatherService.currentUser$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.favoriteCities = user.favoriteCities || [];
      }
    });


    this.checkAuthentication();
    if (this.currentUser) {
      this.loadFavoriteCities();
    }

    this.weatherAlertWebSocketService.connect().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(message => {
      this.alertMessages.push(message); // Spremi primljeno upozorenje u niz
    });
  }

  // Pretraživanje vremena za uneseni grad
  searchWeather(): void {
    const city = this.searchForm.get('city')?.value;
    if (city) {
      forkJoin({
        currentWeather: this.weatherService.getCurrentWeather(city),
        hourlyWeather: this.weatherService.getHourlyWeather(city),
        dailyWeather: this.weatherService.getDailyWeather(city)
      }).pipe(
        finalize(() => {
          console.log(`Završeno dohvaćanje podataka za ${city}`);
        }),
        catchError(error => {
          console.error('Greška pri dohvaćanju vremena:', error);
          return EMPTY;
        })
      ).subscribe(({ currentWeather, hourlyWeather, dailyWeather }) => {
        this.currentWeather = currentWeather;
        this.hourlyWeather = hourlyWeather;
        this.dailyWeather = dailyWeather;
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.weatherAlertWebSocketService.close(); // Zatvori WebSocket vezu

  }


  checkAuthentication() {
    const token = this.weatherService.getToken();
    if (token) {
      this.weatherService.getCurrentUser().subscribe({
        next: (user) => {
          // User is authenticated
          this.toastService.showSuccess(`Welcome back, ${user.username}!`);
        },
        error: () => {
          this.weatherService.logout();
          this.toastService.showWarning('Your session has expired. Please log in again.');
        }
      });
    }
  }

  fetchAllWeatherData(city: string): void {
    this.loading = true;
    this.clearWeatherError();
    forkJoin({
      current: this.weatherService.getCurrentWeather(city),
      hourly: this.weatherService.getHourlyWeather(city),
      daily: this.weatherService.getDailyWeather(city)
    }).pipe(
      catchError(err => {
        this.weatherError = `Failed to fetch weather data: ${err.message}`;
        return EMPTY;
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ current, hourly, daily }) => {
        this.currentWeather = current;
        this.hourlyWeather = hourly;
        this.dailyWeather = daily;
        this.toastService.showSuccess(`Weather data fetched for ${city}`);
      }
    });
  }

  clearWeatherError(): void {
    this.weatherError = null;
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.toastService.showWarning('Please fill in all required fields correctly');
      return;
    }

    const { username, email, password } = this.registerForm.value;
    this.loading = true;
    this.weatherService.register(username, email, password).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.toastService.showSuccess(`Welcome, ${username}!`);
        this.fetchFavoriteWeather();
        this.toastService.showSuccess(`Welcome, ${user.username}!`);
      },
      error: (err) => this.toastService.showError(`Registration failed: ${err.message}`)
    });
  }


  login(): void {
    if (this.loginForm.invalid) {
      this.toastService.showWarning('Please fill in all required fields correctly');
      return;
    }

    const { email, password } = this.loginForm.value;
    this.loading = true;
    this.weatherService.login(email, password).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.currentUser = email;
        this.toastService.showSuccess(`Welcome Back!`);
        this.loadFavoriteCities();
      },
      error: (err) => this.toastService.showError(`Login failed: ${err.message}`)
    });
  }

  logout(): void {
    this.weatherService.logout().subscribe({
      next: () => {
        this.handleSuccessfulLogout();
      },
      error: (err) => {
        this.toastService.showError(`Logout failed: ${err.message}`);
        this.handleSuccessfulLogout();
      }
    });
  }

  private handleSuccessfulLogout(): void {
    this.favoriteWeather = [];
    this.currentUser = null;
    this.favoriteCities = [];
    this.currentWeather = null;
    this.hourlyWeather = null;
    this.dailyWeather = null;
    this.toastService.showInfo('You have been logged out.');
  }

  addToFavorites(): void {
    const currentCity = this.weatherForm.get('cityInput')?.value;
    if (!currentCity) {
      this.toastService.showWarning('Please select a city to add to favorites');
      return;
    }

    this.loading = true;
    this.weatherService.addFavoriteCity(currentCity).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (favoriteCities) => {
        this.toastService.showSuccess(`${currentCity} added to favorites`);
        this.favoriteCities = favoriteCities;
        this.fetchFavoriteWeather();
      },
      error: (error: Error) => this.toastService.showError(`Failed to add favorite city: ${error.message}`)
    });
  }


  fetchFavoriteWeather(): void {
    if (this.currentUser && this.favoriteCities.length > 0) {
      this.loading = true;
      forkJoin(
        this.favoriteCities.map(city => this.weatherService.getCurrentWeather(city))
      ).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (weatherData: WeatherData[]) => this.favoriteWeather = weatherData,
        error: (error: Error) => this.toastService.showError(`Failed to fetch favorite weather: ${error.message}`)
      });
    }
  }

  loadFavoriteCities() {
    this.weatherService.getFavoriteCities().subscribe({
      next: (cities) => {
        this.favoriteCities = cities;
        this.fetchFavoriteWeather();
      },
      error: (error) => this.toastService.showError(`Failed to load favorite cities: ${error.message}`)
    });
  }



  // novo
  removeFromFavorites(city: string): void {
    if (this.currentUser) {
      this.loading = true;
      this.weatherService.removeFavoriteCity(city).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (updatedCities) => {
          this.favoriteCities = updatedCities;
          this.favoriteWeather = this.favoriteWeather.filter(w => !updatedCities.includes(w.city));
          this.toastService.showSuccess(`${city} removed from favorites`);
        },
        error: (error: Error) => this.toastService.showError(`Failed to remove favorite city: ${error.message}`)
      });
    }
  }

  fetchWeatherForCity(city: string): void {
    this.weatherService.getCurrentWeather(city).subscribe({
      next: (weather) => {
        const index = this.favoriteWeather.findIndex(w => w.city === city);
        if (index !== -1) {
          this.favoriteWeather[index] = weather;
        } else {
          this.favoriteWeather.push(weather);
        }
      },
      error: (error) => this.toastService.showError(`Failed to fetch weather for ${city}: ${error.message}`)
    });
  }

  getWeatherIcon(description: string): string {
    // Implementirajte logiku za odabir odgovarajuće ikone na temelju opisa
    if (description.toLowerCase().includes('rain')) {
      return 'rainy';
    } else if (description.toLowerCase().includes('cloud')) {
      return 'cloud';
    } else {
      return 'wb_sunny';
    }
  }

  getWeatherIconColor(description: string): string {
    // Implementirajte logiku za odabir boje ikone na temelju opisa
    if (description.toLowerCase().includes('rain')) {
      return '#4a87d3';
    } else if (description.toLowerCase().includes('cloud')) {
      return '#78909c';
    } else {
      return '#ffd54f';
    }
  }

  compareWeather(): void {
    const citiesToCompare = this.compareControl.value;
    if (!citiesToCompare || citiesToCompare.length < 2) {
      this.toastService.showError('Please select at least two cities to compare.');
      return;
    }

    this.loading = true;
    forkJoin(citiesToCompare.map(city => this.weatherService.getCurrentWeather(city)))
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (results) => {
          this.comparisonResult = results;
        },
        error: (error) => this.toastService.showError(`Failed to compare weather: ${error.message}`)
      });
  }


}
