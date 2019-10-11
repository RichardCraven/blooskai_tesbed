/// <reference types="aws-sdk" />

import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';

AWS.config.accessKeyId = 'AKIAT47U577IFLRFKHHI';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'us-east-2';

@Injectable({
  providedIn: 'root'
})

export class GetFramesService {
    frame_container: any;
    bucket = new AWS.S3({ params: { Bucket: 'blooskai' } });
    constructor() {
        
    }
    getEm(): any[] {
        const frames = [];
        this.bucket.listObjects(function (err, data) {
            if (err) {
                console.log('err is ', err)
                        return alert("err.message is: " + err.message);
            } else {
                console.log('data is ', data)
                document.getElementById('status').innerHTML =
                    'Loaded ' + data.Contents.length + ' items from S3';
                    const filesLength = data.Contents.length / 10;

                    for (var i = 0; i < data.Contents.length/10; i++) {
                        let s3url = '';
                        this.bucket.getObject({Key: data.Contents[i].Key},function(err,file){
                            s3url = "data:image/jpeg;base64," + this.encode(file.Body)
                            frames.push(s3url);
                        });
                    }
                return frames;
            }
        });
        return frames;
    }
    encode (data) {
        let str = data.reduce(function(a,b){ return a+String.fromCharCode(b) },'');
        return btoa(str).replace(/.{76}(?=.)/g,'$&\n');
    }

}