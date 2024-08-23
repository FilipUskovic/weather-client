import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as WeatherActions from './weather.actions';
import {WeatherService} from "../core/service/weather.service";

@Injectable()
export class WeatherEffects {
  loadWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WeatherActions.loadWeather),
      mergeMap(({ city }) =>
        this.weatherService.getCurrentWeather(city).pipe(
          map(weatherData => WeatherActions.loadWeatherSuccess({ weatherData })),
          catchError(error => of(WeatherActions.loadWeatherFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private weatherService: WeatherService
  ) {}
}
