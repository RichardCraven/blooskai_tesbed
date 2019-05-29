import { Component, OnInit } from '@angular/core';
import { DataTransferService } from '../services/data-transfer.service'
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-top-panel',
  templateUrl: './top-panel.component.html',
  styleUrls: ['./top-panel.component.css']
})
export class TopPanelComponent implements OnInit {
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
  };
  constructor(private dataTransfer: DataTransferService) { }
// the grass isnt always greener, the brown spots are just in different places
  ngOnInit() {
    this.paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    this.subscription = this.dataTransfer.getData().subscribe(res => {
      if(res.destination !== 'top') return;
      if(typeof res.data !== 'string'){
        this.rect = res.data;
        this.selectMode = false;
      }
    })
    this.copyCanvas = <HTMLCanvasElement> document.getElementById('copy-canvas');
    this.copyCtx = this.copyCanvas.getContext('2d');
  }
  selectModeToggle(){
    this.selectMode = !this.selectMode;
    if(this.selectMode) this.dataTransfer.passData('mid', 'select')
  }
  initiateCrop(){
    console.log('initiating crop');
    this.imgObj = new Image(625, 625);
    this.imgObj.src = this.selectedFrameSrc
    const that = this;
    this.imgObj.onload = function(){
      that.crop()
    };
  }
  crop(){
    const thumbnail = new Image(625, 625);

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');

    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 1);
    thumbnail.src = newImgSrc;
    ctx.drawImage(thumbnail, 0, 0);
  }
  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio){
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth; 
    tnCanvas.height = newHeight;
    
    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    console.log(imgObj.width, ' <-- should be 625', imgObj.height)
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0, 625, 625);
    

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);
    this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);

    return tnCanvas.toDataURL();
  }
  extractFrames(source) {
    const that = this;
    const self = source.target;
    var video = document.createElement('video');
    video.src = URL.createObjectURL(self.files[0]);
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
      URL.revokeObjectURL(self.src);
      array = [];
    };
    video.muted = true;
    video.addEventListener('loadedmetadata', initCanvas, false);
    video.addEventListener('timeupdate', drawFrame, false);
    video.addEventListener('ended', onend, false);
    video.play();
  }
}
