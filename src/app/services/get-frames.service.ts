/// <reference types="aws-sdk" />

import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import {Observable, Subject} from 'rxjs';

import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

AWS.config.accessKeyId = 'AKIAT47U577IFLRFKHHI';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'us-east-2';

@Injectable({
  providedIn: 'root'
})

export class GetFramesService {
    counter = 0;
    source$: any;
    intervalRef: any;
    filesLength: number;
    frame_container: any;
    framesStore = [];
    progressBar: any;
    bucket = new AWS.S3({ params: { Bucket: 'blooskai' } });
    private framesSubject = new Subject<any>();
    constructor() {
        console.log('constructing service', document.getElementById('progressBar'))
        const that = this;

        this.source$ = of(this.framesStore.length);
        setTimeout(function(){
            that.progressBar = document.getElementById('progressBar');
            console.log('progressBar is ', this.progressBar)
        })
    }
    getFrames(): Observable<any>{
        return this.framesSubject.asObservable()
      }
    getEm() {
        
        // console.log('bucket is ', this.bucket)
        console.log('progress bar is ', this.progressBar)
        const frames = this.framesStore;
        const that = this;
        this.bucket.listObjects(function (err, data) {
            if (err) {
                console.log('err is ', err)
                        return alert("err.message is: " + err.message);
            } else {
                // console.log('this is ', this, 'data is ', data, 'bucket is ', that.bucket)
                that.filesLength = data.Contents.length;
                console.log('length: ', that.filesLength)
                that.intervalRef = setInterval(that.intFunc.bind(that), 500);
                // console.log('file is ', file)
                // setTimeout(() => {
                    for (var i = 0; i < data.Contents.length; i++) {
                        let s3url = '';
                        that.bucket.getObject({Bucket: 'blooskai', Key: data.Contents[i].Key},function(err,file){
                            s3url = "data:image/jpeg;base64," + that.encode(file.Body)
                            // s3url = that.encode(file.Body)
                            frames.push(s3url);
                            // console.log('frames: ', frames)
                        });
                        // console.log('i : ', i)
                        if(i === data.Contents.length - 1){
                            setTimeout(() => {
                                console.log('framesStore length is now ', that.framesStore.length)
                            }, 10000)
                            setTimeout(() => {
                                console.log('frames length is now ', frames.length)
                            }, 30000)
                        }
                        // that.source$
                        // .pipe(takeWhile(val => val <= that.filesLength))
                        // .subscribe(val => {
                        //     console.log(val)
                        //     that.progressBar.style.width =  (that.framesStore.length/that.filesLength * 100)+'%'
                        // });

                        
                        // that.intervalRef = window.setInterval(
                        //     () => that.testFunc()
                        // , 1000);
                    }
                    
                    // this.framesSubject.next(frames);
                // })
                // return frames;
            }
        });
        // return frames;
    }
    intFunc(){
        // console.log('this is ', this, 'interval ref is ', this.intervalRef)
        this.progressBar.style.width =  (this.framesStore.length/this.filesLength * 100)+'%'
        if (this.checkArrSize() === this.filesLength) {
            this.allDone();
            clearInterval(this.intervalRef);
        }
    }
    checkArrSize(): number {
        return this.framesStore.length
    }
    allDone() {
        // console.log(this.framesStore.length, '/', this.filesLength)
        this.framesSubject.next(this.framesStore)
    }
    encode (data) {
        let str = data.reduce(function(a,b){ return a+String.fromCharCode(b) },'');
        return btoa(str).replace(/.{76}(?=.)/g,'$&\n');
    }

}