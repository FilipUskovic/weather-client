import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of, tap} from "rxjs";

Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private cache = new Map<string, [Date, HttpResponse<any>]>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.url);
    if (cachedResponse) {
      const [timestamp, response] = cachedResponse;
      if (new Date().getTime() - timestamp.getTime() < 5 * 60 * 1000) { // 5 minutes
        return of(response.clone());
      } else {
        this.cache.delete(req.url);
      }
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, [new Date(), event.clone()]);
        }
      })
    );
  }
}
