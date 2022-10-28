import { HttpContext, HttpContextToken, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, tap } from "rxjs";
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
        console.log("OVERWRITTEN");
        return this.backendSimulator.connect(req.body).pipe(
            tap((data) => {
                console.log("OUTPUT", data);
            }),
            map((result: TokenResult) => {
                return new HttpResponse({
                    body: JSON.stringify(result),
                    status: result.success ? 200 : 401
                })
            }),
            tap((response) => {
                console.log("RESPONSE", response)
            })
        );
    }
    
    return next.handle(req);

  }
}
