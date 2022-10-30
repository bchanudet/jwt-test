import { HttpContext, HttpContextToken, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, of, switchMap, tap } from "rxjs";
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

      let tokenHeader = req.headers.get("Authorization");

      if(tokenHeader === null){
        return of(new HttpResponse({
          body: "Unauthorized",
          status: 400
        }))
      }

      tokenHeader = tokenHeader.split(" ")[1];

      return this.backendSimulator.refreshToken(tokenHeader).pipe(
        map((data) => {
          return new HttpResponse({
            body: data,
            status: data.success ? 200 : 401
          });
        })
      )
      
    }

    return of(new HttpResponse({
      status: 404,
      statusText: "Not found"
    }));
    
  }
}
