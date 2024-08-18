import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from "rxjs";
import {AsyncPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-favorite-city',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './favorite-city.component.html',
  styleUrl: './favorite-city.component.scss'
})
export class FavoriteCityComponent {
  @Input() favoriteCities!: Observable<string[]>;
  @Output() addCity = new EventEmitter<string>();
  @Output() removeCity = new EventEmitter<string>();
}
