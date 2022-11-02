import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResult } from 'src/app/models/http';
import { InfoService } from 'src/app/services/info.service';

@Component({
  selector: 'app-infos',
  templateUrl: './infos.component.html',
  styleUrls: ['./infos.component.scss']
})
export class InfosComponent implements OnInit {

  public users$: Observable<UserResult[]>;

  constructor(
    private infoSvc: InfoService
  ) {

    this.users$ = infoSvc.getData();

  }

  ngOnInit(): void {
  }

}
