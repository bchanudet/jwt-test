import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { NO_TOKEN } from '../interceptors/token-interceptor';
import { TokenResult } from '../models/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private _currentRefreshToken: string = "";
  private _currentAccessToken: string = "";

  public get currentAccessToken(): string{
    return this._currentAccessToken;
  }
  public get currentRefreshToken(): string{
    return this._currentRefreshToken;
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  connect(login: string, password: string): Observable<boolean>{
    return this.http.post<TokenResult>("/jwt/session", { username: login, password: password},{context: new HttpContext().set(NO_TOKEN,true)}).pipe(
      tap((response) => {
        console.log("TOKENSVC", response)
        if(response.success){
          this._currentRefreshToken = response.token;
        }
      }),
      map((response) => response.success),
    )
  }

  refresh(): Observable<boolean>{
    if(this._currentRefreshToken === ""){
      this.router.navigate(["/login"]);
      return throwError(() => new Error("No token provided"))
    }

    return this.http.post<TokenResult>("/jwt/token", { refreshToken: this._currentRefreshToken }, {context: new HttpContext().set(NO_TOKEN,true)}).pipe(
      tap((response) => {
        console.log("GOT ACCESS", response);
        if(response.success){
          this._currentAccessToken = response.token;
        }
      }),
      map((response) => response.success),
      catchError((err, caught) => {
        // Current refreshToken is KO, go to login
        this.router.navigate(["/login"]);

        return of(err);
      })
    )
  }

}
