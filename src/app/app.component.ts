import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'blooskai-testbed';
  boundingCanvas: HTMLCanvasElement;
  ctx: any;
  rect = {
    startX : undefined,
    startY : undefined,
    h : 0,
    w : 0
  };
  // rect: any;
  drag = false;
  constructor(){
    console.log('constructing')
  }
  ngOnInit(){
    console.log('initializing')
    const el = document.querySelector('input')
    console.log(el)
    this.boundingCanvasInit();
  }

  extractFrames(source) {
    console.log('THIS IS ', this, 'source is ', source.target)
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
      const paneContainer = document.getElementsByClassName('preview-pane-container')[0];
      for (var i = 0; i < array.length; i++) {
        img = new Image();
        img.width = container.clientWidth/array.length*2
        img.height = 200
        img.onload = revokeURL;
        img.src = URL.createObjectURL(array[i]);
        container.appendChild(img);
        img.addEventListener('mouseover', function(){
          paneContainer.innerHTML = '';
          ctx.drawImage(this, 0, 0);
          canvas.toBlob(saveFrame, 'image/jpeg');

          let paneImage = new Image();
          paneImage.width = paneContainer.clientWidth
          paneImage.height = paneContainer.clientHeight
          paneImage.onload = revokeURL;
          paneImage.src = URL.createObjectURL(array[array.length-1]);
          paneContainer.appendChild(paneImage);
          array.shift()
        })
        img.addEventListener('mousedown', function(){
          console.log('image clicked', this)
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
  mouseMove(e) {
    var rect = this.boundingCanvas.getBoundingClientRect();
    if (this.drag) {
      this.rect.w = (e.clientX - rect.left) - this.rect.startX;
      this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
      this.ctx.clearRect(0,0,this.boundingCanvas.width,this.boundingCanvas.height);
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
  }
  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  mouseUp() {
    this.drag = false;
  }
  boundingCanvasInit(){
    this.boundingCanvas =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');
  }
  draw(){
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
}
