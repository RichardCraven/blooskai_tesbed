import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  subject = new Subject<any>();
  constructor() { 
    console.log('initting service');
    
  }
  getData(): Observable<any>{
    return this.subject.asObservable()
  }
  passData(destination, data){
    this.subject.next({destination, data})
  }
}
