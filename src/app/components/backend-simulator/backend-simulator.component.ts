import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendSimulatorService } from 'src/app/backend/backend-simulator.service';

@Component({
  selector: 'app-backend-simulator',
  templateUrl: './backend-simulator.component.html',
  styleUrls: ['./backend-simulator.component.scss']
})
export class BackendSimulatorComponent implements OnInit {

  constructor(
    private backendSvc: BackendSimulatorService
  ) { }

  get validRefreshTokens(): string[]{
    return this.backendSvc.refreshTokens;
  }
  get validAccessTokens(): string[]{
    return this.backendSvc.accessToken;
  }

  ngOnInit(): void {
  }

  public revokeRefresh(token: string){
    this.backendSvc.revokeRefreshToken(token);
  }

  public revokeAccess(token: string){
    this.backendSvc.revokeAccessToken(token);
  }
}
