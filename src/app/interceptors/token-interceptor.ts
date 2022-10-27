import { HttpContext, HttpContextToken, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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
      headers: req.headers.append("Authorization", "Bearer " + this.tokenSvc.currentToken)
    })

    return next.handle(tokenizedReq);
  }
}
