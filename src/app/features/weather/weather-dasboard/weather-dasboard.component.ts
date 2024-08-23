import {Component, inject} from '@angular/core';
import {WeatherService} from "../../../core/service/weather.service";
import {UserService} from "../../../core/service/user-service.service";
import {WeatherForecastComponent} from "../weather-forecast/weather-forecast.component";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-weather-dasboard',
  standalone: true,
  imports: [
    WeatherForecastComponent,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './weather-dasboard.component.html',
  styleUrl: './weather-dasboard.component.scss'
})
export class WeatherDasboardComponent{
  private weatherService = inject(WeatherService);
  private userService = inject(UserService);

}
