import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {WeatherService} from "../../../core/service/weather.service";
import {AsyncPipe, JsonPipe, NgIf} from "@angular/common";
import {debounceTime, distinctUntilChanged, forkJoin, Observable, Subject, takeUntil} from "rxjs";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {ChartComponentComponent} from "../../../chart-component/chart-component.component";
import {WeatherDaily, WeatherHourly} from "../../../core/models/weather.model";
import {WeatherState} from "../../../shared/weaturer.reducer";
import {Store} from "@ngrx/store";
import {WeatherAlertService} from "../../../core/service/weather-alert.service";
import {Security} from "../../../shared/security";

@Component({
  selector: 'app-weather-dasboard',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    JsonPipe,
    MatCardHeader,
    MatCard,
    MatCardContent,
    MatFormField,
    ReactiveFormsModule,
    MatButton,
    MatInput,
    MatTabGroup,
    MatTab,
    ChartComponentComponent,
    MatCardTitle
  ],

  templateUrl: './weather-dasboard.component.html',
  styleUrl: './weather-dasboard.component.scss'
})
export class WeatherDasboardComponent implements OnInit, OnDestroy{
  //weatherState$: Observable<WeatherState>;
  hourlyWeather: any | null = null;
  dailyWeather: any | null = null;
  cityForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private weatherService: WeatherService,
    private fb: FormBuilder
  ) {
    this.cityForm = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.cityForm.get('city')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(city => {
      if (city && city.length >= 2) {
        this.fetchWeatherData(city);
      }
    });
  }


  ngOnDestroy(
   //private store: Store<{ weather: WeatherState }>,
    //private weatherAlertWebSocket: WeatherAlertService,
    //private securityService: Security
  ) {
    this.destroy$.next();
    this.destroy$.complete();
   // this.weatherState$ = this.store.select(state => state.weather);

  }

  onSubmit() {
    if (this.cityForm.valid) {
      const city = this.cityForm.get('city')?.value;
      this.fetchWeatherData(city);
    }
  }

  fetchWeatherData(city: string) {
    forkJoin({
      hourly: this.weatherService.getHourlyWeather(city),
      daily: this.weatherService.getDailyWeather(city)
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Weather data received:', data);
          this.hourlyWeather = data.hourly;
          this.dailyWeather = data.daily;
        },
        error: (error) => console.error('Error fetching weather data:', error)
      });
  }
}
