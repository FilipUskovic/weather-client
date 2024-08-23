
import { createAction, props } from '@ngrx/store';

export const loadWeather = createAction('[Weather] Load Weather', props<{ city: string }>());
export const loadWeatherSuccess = createAction('[Weather] Load Weather Success', props<{ weatherData: any }>());
export const loadWeatherFailure = createAction('[Weather] Load Weather Failure', props<{ error: any }>());

