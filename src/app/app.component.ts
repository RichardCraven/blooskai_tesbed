import { Component, OnInit, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { of } from 'rxjs/observable/of';
import { concat } from 'rxjs/observable/concat';
import { delay } from 'rxjs/operators/delay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'blooskai-testbed';
  // SERVER_URL = 'http://18.221.93.226:5500/reset'
  SERVER_URL = 'http://3.15.139.228:5500'
  

  constructor(private httpClient: HttpClient){
  }
  ngOnInit(){
    // console.log('resetting in app.component')
    this.httpClient.get(this.SERVER_URL + '/reset').subscribe(data => {
      console.log(data);
    });
    // var counter = 0;
    // var t; 
  
    // function color() { 
    //   counter++
    //   console.log('yo. 1', counter)
    //   console.log('t is ', t)
    //   if(counter > 15){
    //     stop();
    //   }
    // } 

    // function fun() { 
    //     t = setInterval(color, 3000); 

    // } 

    // function stop() { 
    //     clearInterval(t); 
    // } 
    // fun()
  }
}

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url === 'saveUrl') {
      const success = of(new HttpResponse({ status: 200 }));
      return success;
    }

    if (req.url === 'removeUrl') {
        return of(new HttpResponse({ status: 200 }));
    }

    return next.handle(req);
  }
}