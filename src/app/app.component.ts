import { Component, View } from 'angular2/core';
import { MyService } from './services/sampleService';
import { SubComponent } from './components/subcomponent/subcomponent.component';
import {Http, Headers,HTTP_PROVIDERS} from 'angular2/http';
import  'bootstrap-webpack/index';
import 'rxjs/add/operator/map'

interface ValidationData {
  userName:string
  password:string
}

@Component({
  selector: 'my-app',
  viewProviders: [HTTP_PROVIDERS],
  templateUrl: 'app/form.html'
})
export class MyAppComponent {
  model:ValidationData = {
    userName: '',
    password: ''
  };

  public randomQuote = '';
  public secretQuote = '';
  public loginFail = false;
  public loginOk = false;

  constructor(public http:Http) {

  }

  onSubmit() {
    console.log(this.model.userName);
    this.authenticate();
  }

  getRandomQuote() {
    this.http.get('http://localhost:3002/api/random-quote')
      .map(res => res.text())
      .subscribe(
        data => this.randomQuote = data,
        err => this.logError(err),
        () => console.log('Random Quote Complete')
      );
  }

  getSecretQuote() {
    var jwt = localStorage.getItem('id_token');
    var authHeader = new Headers();
    if (jwt) {
      authHeader.append('Authorization', 'Bearer ' + jwt);
    }

    this.http.get('http://localhost:3002/api/protected/random-quote', {
        headers: authHeader
      })
      .map(res => res.text())
      .subscribe(
        data => this.secretQuote = data,
        err => this.logError(err),
        () => console.log('Secret Quote Complete')
      );

  }

  logError(err) {
    console.error('There was an error: ' + err);
  }

  authenticate() {
    var username = this.model.userName;
    var password = this.model.password;

    var creds = "username=" + username + "&password=" + password;

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    this.http.post('http://localhost:3002/sessions/create', creds, {
        headers: headers
      })
      .map(res => res.json())
      .subscribe(
        data => this.saveJwt(data.id_token),
        err => {
          this.logError(err);
          this.loginFail = true;
          this.loginOk = false;
        },
        () => {
          console.log('Authentication Complete');
          this.loginOk = true;
          this.loginFail = false;
        }
      );
  }

  saveJwt(jwt) {
    if (jwt) {
      localStorage.setItem('id_token', jwt)
    }
  }
}
