export interface WeatherData {
  city: string,
  temperature: number,
  description: string,
  uvIndex: number,
  visibility: number,
  // razina 2
  humidity: number,
  windSpeed: number,
  forecast: ForeCast,
  feelsLikeTemperature: number,
  pressure: number
}

export interface ForeCast {
  Current: string,
  Hourly: string,
  Daily: string
}

export interface WeatherHourly {
  time: string[];
  temperature2m: number[];
  description: string[];
  apparentTemperature: number[];
  relativeHumidity2m: number[];
  windspeed10m: number[];
  pressureMsl: number[];
  visibility: number[];
  uvIndex: number[];
}

export interface WeatherDaily {
  time: string[];
  temperature: number[];
  description: string[];
  uvIndex: number[];
  windSpeed: number[];
  feelsLikeTemperature: number[];
  humidity: number[];
}

