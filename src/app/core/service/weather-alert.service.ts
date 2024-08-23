import { Injectable } from '@angular/core';
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";
import {environment} from "../../shared/enviroment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WeatherAlertService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket(environment);
  }

  public connect(): Observable<any> {
    return this.socket$;
  }

  public sendMessage(msg: any): void {
    this.socket$.next(msg);
  }

  public close(): void {
    this.socket$.complete(); // Zatvara vezu i dovršava WebSocketSubject
  }
}
