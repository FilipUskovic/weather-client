import { createReducer, on } from '@ngrx/store';
import * as WeatherActions from './weather.actions';

export interface WeatherState {
  currentWeather: any;
  hourlyWeather: any;
  dailyWeather: any;
  loading: boolean;
  error: any;
}

export const initialState: WeatherState = {
  currentWeather: null,
  hourlyWeather: null,
  dailyWeather: null,
  loading: false,
  error: null
};

export const weatherReducer = createReducer(
  initialState,
  on(WeatherActions.loadWeather, state => ({ ...state, loading: true })),
  on(WeatherActions.loadWeatherSuccess, (state, { weatherData }) => ({
    ...state,
    currentWeather: weatherData.current,
    hourlyWeather: weatherData.hourly,
    dailyWeather: weatherData.daily,
    loading: false
  })),
  on(WeatherActions.loadWeatherFailure, (state, { error }) => ({ ...state, error, loading: false }))
);
