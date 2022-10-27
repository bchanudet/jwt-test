import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

interface TokenResponse {
  success: boolean;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private __currentToken$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public get currentToken(): string{
    return this.__currentToken$.value;
  }

  constructor(
    private http: HttpClient
  ) { }

  connect(login: string, password: string): Observable<boolean>{
    return this.http.post<TokenResponse>(environment.webservice + "/jwt/session", { username: login, password: password}).pipe(
      tap((response) => {
        if(response.success){
          this.__currentToken$.next(response.token);
        }
      }),
      map((response) => response.success),
      catchError((err, caught) => {
        return of(false);
      })
    )
  }

}
