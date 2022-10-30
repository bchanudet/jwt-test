import { Injectable } from '@angular/core';
import { generateSecret, SignJWT } from 'jose';
import { delay, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ConnectionPayload, DataResult, TokenResult } from '../models/http';

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
    return from(secret).pipe(
      switchMap((key) => new SignJWT({caller: caller})
      .setIssuedAt()
      .setProtectedHeader({alg: "HS256"})
      .setExpirationTime(isRefreshToken ? "5m" : "30s")
      .sign(key)
    ))
  }

  public connect(data: ConnectionPayload) : Observable<TokenResult>{
    return of(false).pipe(
      map(() => {
        console.log("test",users.find((u) => u.username === data.username && u.password === data.password));
        return (users.find((u) => u.username === data.username && u.password === data.password) !== undefined)
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

  public getData(token: string) : Observable<DataResult> {
    const data: DataResult = {
      data: "Hello world!",
      time: new Date(),
      test: true
    }
    return of(data).pipe(
      delay(250)
    );
  }
}
