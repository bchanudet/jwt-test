import { Injectable } from '@angular/core';
import { generateSecret, SignJWT } from 'jose';
import { delay, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ConnectionPayload, TokenResult } from '../models/http';

const users: {username:string, password: string}[] = [
  {username:"bec", password:"test"}
];

const secret = generateSecret("HS256");

@Injectable({
  providedIn: 'root'
})
export class BackendSimulatorService {

  private _refreshTokens: string[] = [];
  private _accessTokens: string[] = [];

  constructor() { }

  private generateToken(caller: string, isRefreshToken: boolean): Observable<string> {
    return from(new SignJWT({caller: caller})
      .setIssuedAt()
      .setProtectedHeader({alg: "HS256"})
      .setExpirationTime(isRefreshToken ? "5m" : "30s")
      .sign(secret))
  }

  public connect(data: ConnectionPayload) : Observable<TokenResult>{
    console.log("SIMULATOR INPUT", data);
    return of(false).pipe(
      map(() => {
        return (users.filter((u) => u.username === data.username && u.password === data.password) !== null)
      }),
      switchMap(found => found ? this.generateToken(data.username, true): of("")),
      tap((token) => {
        if(token !== ""){
          this._refreshTokens.push(token);
        }
      }),
      map((token) => {
        return {
          success: (token !== ""),
          token: token
        }
      }),
      tap((data) => {
        console.log("SIMULATOR OUTPUT", data);
      }),
      delay(250)
    )
  }

  public refreshToken(token: string) : Observable<TokenResult> {
    return of(false).pipe(
      map(() => (this._refreshTokens.filter(t => t === token) !== null)),
      switchMap(found => found ? this.generateToken("", false) : of("")),
      map((token) => {
        return {
          success: token !== "",
          token: token
        }
      }),
      delay(250)
    )
  } 
}
