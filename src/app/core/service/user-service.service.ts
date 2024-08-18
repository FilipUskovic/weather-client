import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //private apiUrl = `${environment.apiUrl}/users`;
  private apiUrl = 'http://localhost:8080/api/api/user';

  private httpClient = inject(HttpClient);

  getFavoriteCities(username: string): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.apiUrl}/${username}/favorites`);
  }

  addFavoriteCity(username: string, city: string): Observable<User> {
    return this.httpClient.post<User>(`${this.apiUrl}/${username}/favorites`, { city });
  }

  removeFavoriteCity(username: string, city: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${username}/remove-favorites`, { params: { city } });
  }
}
