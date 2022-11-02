import { HttpContext, HttpContextToken, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { BackendSimulatorService } from "../backend/backend-simulator.service";
import { ConnectionPayload, TokenResult } from "../models/http";
import { TokenService } from "../services/token.service";

export const NO_TOKEN = new HttpContextToken<boolean>(() => false);


@Injectable()
export class BackendInterceptor implements HttpInterceptor{

  constructor(
    private backendSimulator: BackendSimulatorService
  ){

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("BACKEND", req);

    if(req.method === "POST" && req.url.endsWith("/jwt/session")){
        return this.backendSimulator.connect(req.body).pipe(
            tap((data) => {
                console.log("OUTPUT", data);
            }),
            map((result: TokenResult) => {
                return new HttpResponse({
                    body: result,
                    status: result.success ? 200 : 401
                })
            })
        );
    }

    if(req.method === "POST" && req.url.endsWith("/jwt/token")){

      let tokenHeader = req.body.refreshToken;

      return this.backendSimulator.refreshToken(tokenHeader).pipe(
        map((data) => {
          return new HttpResponse({
            body: data,
            status: data.success ? 200 : 401
          });
        }),
        catchError((err) => {
          return throwError(() => new HttpResponse({
            status: 401,
            statusText: "Unauthorized"
          }))
        }),
      )

    }

    if(req.method === "GET" && req.url.endsWith("users")){

      let tokenHeader = req.headers.get("Authorization");
      if(tokenHeader === null){
        return throwError(() => new HttpResponse({
          body: "Unauthorized",
          status: 400
        }))
      }

      tokenHeader = tokenHeader.split(" ")[1];

      return this.backendSimulator.getData(tokenHeader).pipe(
        map((data) => {
          return new HttpResponse({
            body: data,
            status: 200
          });
        }),
        catchError((err) => {
          return throwError(() => new HttpResponse({
            status: 401,
            statusText: "Unauthorized"
          }))
        }),
      )
    }

    if(req.method === "GET" && req.url.includes("user/")){

      let tokenHeader = req.headers.get("Authorization");
      if(tokenHeader === null){
        return throwError(() => new HttpResponse({
          body: "Unauthorized",
          status: 400
        }))
      }

      tokenHeader = tokenHeader.split(" ")[1];

      const i : number = parseInt(req.url.split("/").reverse()[0]);

      return this.backendSimulator.getOneData(tokenHeader, i).pipe(
        map((data) => {
          return new HttpResponse({
            body: data,
            status: 200
          });
        }),
        catchError((err) => {
          return throwError(() => new HttpResponse({
            status: 401,
            statusText: "Unauthorized"
          }))
        }),
      )
    }

    return throwError(() => new HttpResponse({
      status: 404,
      statusText: "Not found"
    }));

  }
}
