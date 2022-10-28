import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private form: FormGroup = new FormGroup({
    username: new FormControl<string>("", [Validators.required]),
    password: new FormControl<string>("", [Validators.required])
  });

  public get loginForm() : FormGroup{
    return this.form;
  }

  constructor(
    private tokenSvc: TokenService,
    private router: Router
  ) { }


  public submit(){
    this.tokenSvc.connect(this.form.get("username")?.value, this.form.get("password")?.value).subscribe({
      next: (success) => {
        if(success)
          this.router.navigate(['info']);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  ngOnInit(): void {
  }

}
