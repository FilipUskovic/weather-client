import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class Security{
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  // Metoda za sanitizaciju HTML-a protiv XSS napada
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Metoda za dohvaćanje CSRF tokena
  getCsrfToken(): string {
    return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');
  }

  // Metoda za dodavanje CSRF tokena u zahtjeve
  addCsrfToken(options: any = {}): any {
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      options.headers = options.headers || new HttpHeaders();
      options.headers = options.headers.set('X-XSRF-TOKEN', csrfToken);
    }
    return options;
  }
}
