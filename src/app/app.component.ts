import { Component, OnInit, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

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
  
  constructor(){
    console.log('constructing')
  }
  ngOnInit(){
    console.log('initializing')
    const el = document.querySelector('input')
    console.log(el)
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