import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { generateSecret, SignJWT } from 'jose';
import { delay, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ConnectionPayload, TokenResult, UserResult } from '../models/http';

const users: {username:string, password: string}[] = [
  {username:"bec", password:"test"}
];

const data: UserResult[] =  [
  {
      "id": "10",
      "name": "Harjas Malhotra",
      "email": "harjas@gmail.com",
      "job_title": "CEO&Founder",
      "created_at": "2021-01-31 00:07:38",
      "updated_at": "2021-01-31 00:07:38"
  },
  {
      "id": "9",
      "name": "Alisha Paul",
      "email": "alisha@gmail.com",
      "job_title": "CTO",
      "created_at": "2021-01-31 00:07:38",
      "updated_at": "2021-01-31 00:07:38"
  },
  {
      "id": "8",
      "name": "Mart Right",
      "email": "marrk9658@yahoo.com",
      "job_title": "Fresher",
      "created_at": "2021-01-31 00:06:25",
      "updated_at": "2021-01-31 00:06:25"
  },
  {
      "id": "7",
      "name": "Brad Pitter",
      "email": "brad@gmail.com",
      "job_title": "Junior Developer",
      "created_at": "2021-01-31 00:06:25",
      "updated_at": "2021-01-31 00:06:25"
  },
  {
      "id": "6",
      "name": "Ervin Dugg",
      "email": "Ervin69@gmail.com",
      "job_title": "HR",
      "created_at": "2021-01-29 23:16:26",
      "updated_at": "2021-01-29 23:16:26"
  },
  {
      "id": "5",
      "name": "Graham Bell",
      "email": "Graham@bell.biz",
      "job_title": "Seo Expert",
      "created_at": "2021-01-29 23:16:26",
      "updated_at": "2021-01-29 23:16:26"
  },
  {
      "id": "4",
      "name": "James Rush",
      "email": "james369@hotmail.com",
      "job_title": "Junior Developer",
      "created_at": "2021-01-29 23:14:55",
      "updated_at": "2021-01-29 23:14:55"
  },
  {
      "id": "3",
      "name": "Deepak Dev",
      "email": "deepak@gmail.com",
      "job_title": "Senior Developer",
      "created_at": "2021-01-29 11:36:14",
      "updated_at": "2021-01-29 11:36:14"
  },
  {
      "id": "1",
      "name": "Ajay Rich",
      "email": "therichposts@gmail.com",
      "job_title": "Full Stack Developer",
      "created_at": "2021-01-29 11:36:14",
      "updated_at": "2021-01-29 11:36:14"
  }
]

const secret = generateSecret("HS256");

@Injectable({
  providedIn: 'root'
})
export class BackendSimulatorService {

  private _refreshTokens: string[] = [];
  private _accessTokens: string[] = [];

  public get refreshTokens() : string[]{
    return this._refreshTokens;
  }
  public get accessToken(): string[]{
    return this._accessTokens;
  }

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
        return (users.find((u) => u.username === data.username && u.password === data.password) !== undefined)
      }),
      map((found) => {
        if(!found){
          throw new Error("User not found");
        }
        return found;
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
      map(() => (this._refreshTokens.find(t => t === token) !== undefined)),
      map((found) => {
        if(!found){
          throw new Error("User not found");
        }
        return found;
      }),
      switchMap(found => found ? this.generateToken("", false) : of("")),
      tap((token) => {
        if(token !== ""){
          this._accessTokens.push(token);
        }
      }),
      map((token) => {
        return {
          success: token !== "",
          token: token
        }
      }),
      delay(250)
    )
  }

  public getData(token: string) : Observable<UserResult[]> {

    return of(true).pipe(
      map(() => {
        if(this._accessTokens.findIndex(t => t === token) === -1){
          throw new Error("INVALID TOKEN");
        }
        return data;
      })
    )
  }

  public getOneData(token: string, i: number) : Observable<UserResult> {

    return of(true).pipe(
      map(() => {
        if(this._accessTokens.findIndex(t => t === token) === -1){
          throw new Error("INVALID TOKEN");
        }
        return data[i % data.length];
      })
    )
  }

  public revokeRefreshToken(token: string): void{
    const index = this._refreshTokens.findIndex(t => t === token);
    if(index === -1){
      return;
    }

    this._refreshTokens.splice(index,1);

  }

  public revokeAccessToken(token: string): void{
    const index = this._accessTokens.findIndex(t => t === token);
    if(index === -1){
      return;
    }

    this._accessTokens.splice(index,1);

  }
}
