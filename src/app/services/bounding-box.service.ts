import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BoundingBoxService {
    constructor() {
        console.log('constructing bounding boxservice')
    }
    //Bounding box is calculated [top left x position, top left y position, width, hieghth]
}