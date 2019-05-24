import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  @ViewChild('bounding-canvas') boundingCanvas: ElementRef;
  private context: CanvasRenderingContext2D;
  title = 'blooskai-testbed';
  // boundingCanvas: HTMLCanvasElement;
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
  ngAfterViewInit(){
    this.ctx = (this.boundingCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
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
      // console.log('in on end, e is ', e, ', array.length is ', array.length, array)
      const container = document.getElementsByClassName('frame-container')[0]
      const paneContainer = document.getElementsByClassName('preview-pane-container')[0]
      // const preview = 
      console.log('container is ', container.clientWidth, container.clientWidth/array.length)
      for (var i = 0; i < array.length; i++) {
        img = new Image();
        img.width = container.clientWidth/array.length*2
        img.height = 200
        img.onload = revokeURL;
        img.src = URL.createObjectURL(array[i]);
        container.appendChild(img);
        img.addEventListener('mouseover', function(){
          // array = [];
          paneContainer.innerHTML = '';
          console.log('hover, this is', this, 'paneContainer is ', paneContainer)
          // pane.src= URL.createObjectURL(this.src)
          ctx.drawImage(this, 0, 0);
          canvas.toBlob(saveFrame, 'image/jpeg');

          let paneImage = new Image();
          paneImage.width = paneContainer.clientWidth
          paneImage.height = paneContainer.clientHeight
          paneImage.onload = revokeURL;
          paneImage.src = URL.createObjectURL(array[array.length-1]);
          paneContainer.appendChild(paneImage);
          array.shift()
          console.log(array.length)
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
    // let el = e.currentTarget;
    // console.log('a',e)
    // console.log(e.pageX)
    // console.log('z', e.offsetX)
    // console.log(this.rect.startX)
    // console.log(this)
    if (this.drag) {
      // console.log(e, e.pageX - e.offsetX, this.rect.startX)
      this.rect.w = (e.pageX - e.offsetX) - this.rect.startX;
      this.rect.h = (e.pageY - e.offsetY) - this.rect.startY ;
      this.ctx.clearRect(0,0,(this.boundingCanvas.nativeElement as HTMLCanvasElement).width,(this.boundingCanvas.nativeElement as HTMLCanvasElement).height);
      // console.log(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h)
      this.draw();
    }
  }
  mouseDown(e) {
    console.log(e.pageX - e.offsetX)
    console.log(e.pageY - e.offsetY)
    // console.log('mousedown', e.pageX - e.offsetX);
    console.log('yoooo', (this.boundingCanvas.nativeElement as HTMLCanvasElement))
    console.log(this.rect.startX)
    console.log(this.rect.startY)
    // console.log(this.boundingCanvas.attribute)
    this.rect.startX = e.pageX - (this.boundingCanvas.nativeElement as HTMLCanvasElement).offsetX;
    this.rect.startY = e.pageY - e.offsetY;
    // console.log(this.rect.startX)
    // console.log(this.rect.startY)
    this.drag = true;
    // console.log(this.rect.startX)
      // console.log(this.rect.startY)
  }
  mouseUp() {
    this.drag = false;
  }
  boundingCanvasInit(){
    console.log('in bounding init');
    // this.boundingCanvas.nativeElement =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
    // this.ctx = this.boundingCanvas.getContext('2d');
  }
  draw(){
    // console.log('draw?', this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    // console.log(this)
    this.ctx.fillRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
}
