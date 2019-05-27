import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'blooskai-testbed';
  boundingCanvas: HTMLCanvasElement;
  readyToCrop: boolean = false;
  imgObj: any;
  loadTimer: any;
  paneContainer: any;
  thumbnailContainer: any;
  selectedFrameSrc: any;
  selectMode: boolean = false;
  cropping: boolean = false;
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
    this.paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    this.thumbnailContainer = document.getElementsByClassName('captured-thumbnail')[0];
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
    this.cropping = true;
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
    if(this.cropping){
      console.log('SHOULD WORKJ');
      
      this.readyToCrop = true;
      this.selectMode = false;
    }
  }
  boundingCanvasInit(){
    this.boundingCanvas =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');
  }
  draw(){
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
  initiateCrop(src){
    console.log('kkk',this.selectedFrameSrc, this.selectMode, this.readyToCrop)
    if(this.selectMode || !this.readyToCrop ) return
    console.log('initiating crop');
    this.imgObj = new Image();
    this.imgObj.src = this.selectedFrameSrc;
    const that = this;
    this.imgObj.onload = function(){
      that.onPreloadComplete()
    };
    function onImgLoaded() {
      console.log('image [this] is ', that)
      if (that.loadTimer != null) clearTimeout(that.loadTimer);
      if (!that.imgObj.complete) {
        that.loadTimer = setTimeout(function() {
          onImgLoaded();
        }, 3);
      } else {
        that.onPreloadComplete();
      }
    }
  }
  onPreloadComplete(){
    console.log('PRELOAD COMPLETE, imgObj is ', this.imgObj);
    const thumbnail = new Image();
    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');
    var newImgSrc = this.getImagePortion(this.imgObj, Math.abs(this.rect.w), Math.abs(this.rect.h), this.rect.startX, this.rect.startY, 1);
    // console.log(newImgSrc)
    thumbnail.src = newImgSrc;
    console.log(thumbnail)
    document.getElementsByClassName('top-window')[0].appendChild(thumbnail)
    ctx.drawImage(this.imgObj, 0, 0)
    // const canvas = this.
    // var canvas = document.createElement('canvas');
    // var ctx = canvas.getContext('2d');
    // canvas.width = 300;
    // canvas.height = 300;

    // ctx.drawImage(this.imgObj, 0, 0)



    return
    this.thumbnailContainer.innerHTML = '';
    //call the methods that will create a 64-bit version of thumbnail here.
    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 2);

    // let thumbnail = new Image();
          // thumbnail.width = that.paneContainer.clientWidth
          // thumbnail.height = that.paneContainer.clientHeight
          // thumbnail.onload = revokeURL;
          thumbnail.src = URL.createObjectURL(newImgSrc);
    //place image in appropriate div
    // const thumbnail = <HTMLImageElement>document.getElementById("thumbnail");

    this.thumbnailContainer.appendChild(thumbnail);
    // console.log('newImg = ', newImg)
    // thumbnail.src = newImg;
  }
  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio){
    console.log('new w and h : ', newWidth, newHeight)
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth; tnCanvas.height = newHeight;
    
    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    console.log('imgObj w and h', imgObj.width, imgObj.height)
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);
    
    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth * ratio, newHeight * ratio,0,0,300,300);
    return tnCanvas.toDataURL();
   }
  
}
