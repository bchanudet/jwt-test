import { HttpContext, HttpContextToken, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, of, switchMap, tap, throwError } from "rxjs";
import { TokenService } from "../services/token.service";

export const NO_TOKEN = new HttpContextToken<boolean>(() => false);


@Injectable()
export class TokenInterceptor implements HttpInterceptor{

  constructor(
    private tokenSvc: TokenService
  ){

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Do not intercept the request if specifically asked.
    if(req.context.get(NO_TOKEN) === true){
      return next.handle(req);
    }

    // Add token to the headers
    const tokenizedReq = req.clone({
      headers: req.headers.append("Authorization", "Bearer " + this.tokenSvc.currentAccessToken)
    })

    return next.handle(tokenizedReq).pipe(
      tap((res) => {
        console.log("Result", res);
      }),
      catchError((err) => {
        console.error("Caught error", err);

        if(err.status === 401){
          return this.tokenSvc.refresh().pipe(
            switchMap((success) => {
              if(success){
                console.log("Got success");
                const retriedReq = tokenizedReq.clone({
                  headers: tokenizedReq.headers.set("Authorization", "Bearer " + this.tokenSvc.currentAccessToken)
                })
                return next.handle(retriedReq);
              }
              else{
                return throwError(() => new Error("unknown"));
              }
            })
          )
        }

        return of(err);
      })
    );
  }
}
