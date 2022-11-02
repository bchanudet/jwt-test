import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResult } from '../models/http';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(
    private http: HttpClient
  ) { }

  public getData(): Observable<UserResult[]>{
    return this.http.get<UserResult[]>("/users");
  }

  public getOne(i : number): Observable<UserResult>{
    return this.http.get<UserResult>("/user/" + i);
  }

}
