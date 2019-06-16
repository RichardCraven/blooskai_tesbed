import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DataTransferService } from '../services/data-transfer.service'

@Component({
  selector: 'media-upload',
  template: `
  <kendo-upload
    [saveUrl]="uploadSaveUrl"
    [removeUrl]="uploadRemoveUrl"
    (select)="onSelect($event)">
    <kendo-upload-messages select="Upload media"></kendo-upload-messages>
  </kendo-upload>
  `
})
export class UploadComponent implements OnInit{
  imgObj: any;
  subscription: Subscription;
  copyCanvas: HTMLCanvasElement;
  copyCtx: any;
  selectedFrameSrc: any;
  paneContainer: any;
  selectMode: boolean = false;
  rect = {
    startX : undefined,
    startY : undefined,
    endX: undefined,
    endY: undefined,
    h : 0,
    w : 0
  }
  constructor(public dataTransfer: DataTransferService) { }
  ngOnInit(){
    this.paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    console.log('yeha ', this.dataTransfer)
    this.subscription = this.dataTransfer.getData().subscribe(res => {
      if(res.destination !== 'mid') return;
      console.log('mid receiving data with type ', typeof res.data);
      res.destination === 'mid' && console.log('receiving data, data is ', res.data)
      if(typeof res.data === 'string'){
        this.selectMode = !this.selectMode;
      }
    })
  }
  onSelect(e){
    console.log('yooo, insite', typeof e.files[0].rawFile, e.files[0].rawFile);
    this.extractFrames(e)
  }
  extractFrames(source) {
    const that = this;
    var video = document.createElement('video');
    // video.src = URL.createObjectURL(self.files[0]);
    video.src = URL.createObjectURL(source.files[0].rawFile);
    var array = [];
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var pro = document.querySelector('#progress');

    function initCanvas(e) {
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;

      
    }

    function drawFrame(e) {
      this.pause();
      ctx.drawImage(this, 0, 0);
      /* 
      this will save as a Blob, less memory consumptive than toDataURL
      a polyfill can be found at
      https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
      */
      canvas.toBlob(saveFrame, 'image/jpeg');
      pro.innerHTML = ((this.currentTime / this.duration) * 100).toFixed(2) + ' %';
      if (this.currentTime < this.duration) {
        this.play();
      }
    }

    function saveFrame(blob) {
      array.push(blob);
    }

    function revokeURL(e) {
      // console.log('in revoke, e is ', e)
      URL.revokeObjectURL(this.src);
    }
    
    function onend(e) {
      const container = document.getElementsByClassName('frame-container')[0];
      for (var i = 0; i < array.length; i++) {
        let img = new Image();
        img.width = container.clientWidth/array.length*2
        img.height = 200
        img.onload = revokeURL;
        img.src = URL.createObjectURL(array[i]);
        container.appendChild(img);
        img.addEventListener('mouseover', function(){
          
          if(!that.selectMode) return;
          console.log('inside......!!!');
          that.paneContainer.innerHTML = '';
          ctx.drawImage(this, 0, 0);
          canvas.toBlob(saveFrame, 'image/jpeg');

          let paneImage = new Image();
          paneImage.width = that.paneContainer.clientWidth
          paneImage.height = that.paneContainer.clientHeight
          paneImage.onload = revokeURL;
          
          const frame = array[array.length-1]
          if(frame !== undefined){
            paneImage.src = URL.createObjectURL && URL.createObjectURL(frame);
            that.selectedFrameSrc = URL.createObjectURL(array[array.length-1])
            that.paneContainer.appendChild(paneImage);
            array.shift()
          }
        })
        img.addEventListener('mousedown', function(){
          if(!that.selectMode) return;
          this.setAttribute("style", "border: 2px solid blue")
        })
      }
      // we don't need the video's objectURL anymore
      URL.revokeObjectURL(e.src);
      array = [];
    };
    video.muted = true;
    video.addEventListener('loadedmetadata', initCanvas, false);
    video.addEventListener('timeupdate', drawFrame, false);
    video.addEventListener('ended', onend, false);
    video.play();
  }
}