import { Component, OnInit } from '@angular/core';
import { DataTransferService } from '../services/data-transfer.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mid-panel',
  templateUrl: './mid-panel.component.html',
  styleUrls: ['./mid-panel.component.css']
})
export class MidPanelComponent implements OnInit {
  boundingCanvas: HTMLCanvasElement;
  ctx: any;
  drag: boolean = false;
  readyToCrop: boolean = false;
  cropping: boolean = false;
  selectMode: boolean = false;
  imgObj: any;
  loadTimer: any;
  selectedFrameSrc: any;
  paneContainer: any;
  thumbnailContainer: any;

  rect = {
    startX : undefined,
    startY : undefined,
    endX: undefined,
    endY: undefined,
    h : 0,
    w : 0
  };
  subscription: Subscription;
  constructor(private dataTransfer: DataTransferService) { }

  ngOnInit() {
    console.log('mid panel init');
    this.boundingCanvasInit();
    this.paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    this.thumbnailContainer = document.getElementsByClassName('captured-thumbnail')[0];

    const paneImage = new Image();
    paneImage.height = 625;
    paneImage.src = '../../../assets/sample.png'
    this.paneContainer.appendChild(paneImage);

    this.subscription = this.dataTransfer.getData().subscribe(res => {
      res.destination === 'mid' && console.log('receiving data, data is ', res.data)
    })
  }
  boundingCanvasInit(){
    this.boundingCanvas =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');
    // this.boundingCanvas.dr
  }
  mouseMove(e) {
    var rect = this.boundingCanvas.getBoundingClientRect();
    if (this.drag) {
      this.rect.w = (e.clientX - rect.left) - this.rect.startX;
      this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
      this.ctx.clearRect(0,0,this.boundingCanvas.width,this.boundingCanvas.height);
      // console.log(this.rect.w)
      this.draw();
    }
  }
  mouseDown(e) {
    var rect = this.boundingCanvas.getBoundingClientRect();

    this.rect.startX = e.clientX - rect.left;
    this.rect.startY = e.clientY - rect.top;

    console.log(this.rect.startX)
    console.log(this.rect.startY)
    this.drag = true;
    this.cropping = true;
  }
  // getMousePos(canvas, evt) {
  //   var rect = canvas.getBoundingClientRect();
  //   return {
  //     x: evt.clientX - rect.left,
  //     y: evt.clientY - rect.top
  //   };
  // }
  mouseUp(e) {
    this.drag = false;
    if(this.cropping){
      var rect = this.boundingCanvas.getBoundingClientRect();
      this.rect.endX = e.clientX - rect.left;
      this.rect.endY = e.clientY - rect.top;
      this.readyToCrop = true;
      this.selectMode = false;
      console.log('rect: ', this.rect);
      this.dataTransfer.passData('top', this.rect)
    }
  }
  draw(){
    this.ctx.strokeStyle = "#FFFFFF"
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
  
  extractFrames(source) {
    console.log('THIS IS ', this, 'source is ', source.target)
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
      var img;
      // do whatever with the frames
      const container = document.getElementsByClassName('frame-container')[0]
      // const paneContainer = document.getElementsByClassName('preview-pane-container')[0];
      for (var i = 0; i < array.length; i++) {
        img = new Image();
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
          paneImage.src = URL.createObjectURL(array[array.length-1]);
          that.selectedFrameSrc = URL.createObjectURL(array[array.length-1])
          that.paneContainer.appendChild(paneImage);
          array.shift()
        })
        img.addEventListener('mousedown', function(){
          if(!that.selectMode) return;
          this.setAttribute("style", "border: 2px solid blue")
        })
      }
      // we don't need the video's objectURL anymore
      URL.revokeObjectURL(self.src);

      array = [];
    }
    
    video.muted = true;

    video.addEventListener('loadedmetadata', initCanvas, false);
    video.addEventListener('timeupdate', drawFrame, false);
    video.addEventListener('ended', onend, false);

    video.play();
  }

}
