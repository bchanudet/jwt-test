import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { UserResult } from 'src/app/models/http';
import { InfoService } from 'src/app/services/info.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public user$: Observable<UserResult>;

  constructor(
    route: ActivatedRoute,
    infoSvc: InfoService
  ) {

    this.user$ = route.params.pipe(
      map((params) => parseInt(params["i"])),
      switchMap((index) => infoSvc.getOne(index))
    )
  }

  ngOnInit(): void {
  }

}
