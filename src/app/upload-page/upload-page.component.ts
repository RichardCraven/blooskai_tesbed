import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css']
})
export class UploadPageComponent implements OnInit {
  content = [];
  progressBar: any;
  resolution1080 = true;

  uploading = false;
  selectedFrameSrc: any;
  imgObj: any;
  paneContainer: any;
  frameSelected = false;

  setDimensions = {
    height: 1080,
    width: 1920
  }

  // Below are props from mid panel
  boundingCanvas: HTMLCanvasElement;
  ctx: any;
  drag: boolean = false;
  readyToCrop: boolean = false;
  cropping: boolean = false;
  selectMode: boolean = false;
  loadTimer: any; 
  thumbnailContainer: any;
  rect = {
    startX : null,
    startY : null,
    endX: null,
    endY: null,
    h : 0,
    w : 0
  };

  constructor() { }

  ngOnInit() {
    
    const youtubeVids = [
      {
        name: "Jerry's Place",
        type: 'YouTube',
        objectsTagged: 8,
        id: 3453462,
        lastEdited: '6/14/2016'
      },
      {
        name: 'TRL',
        type: 'YouTube',
        objectsTagged: 12,
        id: 3458242,
        lastEdited: '8/9/2015'
      }
    ];
    const tvShows = [];
    const movies = [
      {
        name: 'Wolf of Wall Street',
        type: 'movie',
        objectsTagged: 48,
        id: 3453462,
        lastEdited: '7/4/2017'
      },
      {
        name: 'Social Network',
        type: 'movie',
        objectsTagged: 62,
        id: 3458242,
        lastEdited: '7/9/2017'
      },
      {
        name: 'The Hustler',
        type: 'movie',
        objectsTagged: 21,
        id: 3453462,
        lastEdited: '4/19/2018'
      },
      {
        name: 'Training Day',
        type: 'movie',
        objectsTagged: 38,
        id: 3451112,
        lastEdited: '9/9/2018'
      },
      {
        name: 'The Help',
        type: 'movie',
        objectsTagged: 91,
        id: 2813462,
        lastEdited: '7/1/2019'
      },
    ]

    movies.forEach( el => {
      this.content.push(el)
    })
    youtubeVids.forEach(el => {
      this.content.push(el)
    })
  }
  beginUpload(){
    this.uploading = true;
    
    this.boundingCanvasInit();
  }
  boundingCanvasInit(){
    this.boundingCanvas =  document.getElementById('hd-bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');
    console.log('initting bounding canvas as ', this.boundingCanvas)
  }
  setBoundingCanvasDimensions(height){
    console.log('in set dimensions, height is ', height);
    height === 720 ? this.setDimensions = {
      height: 720,
      width: 1280
    } : this.setDimensions = {
      height: 1080,
      width: 1920
    }
    //to potentially manually reset the canvas dimensions
  }
  initiateCrop(){
    console.log('initiating crop');
    this.imgObj = new Image(this.setDimensions.height, this.setDimensions.width);
    this.imgObj.src = this.selectedFrameSrc
    const that = this;
    this.imgObj.onload = function(){
      that.crop()
    };
  }
  crop(){
    console.log('crop')
  }
  waitThenExtract(source){
    this.uploading = true;
    const that = this;
    setTimeout(function(){
      that.progressBar = document.getElementById("progressBar"); 
      console.log('PROGRESS', that.progressBar)
    }, 0)
    setTimeout(function(){that.extractFrames(source)}, 500)
  }
  extractFrames(source) {
    const that = this;
   
    let bool = false;
    this.paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    
    const self = source.target;
    var video = document.createElement('video');
    video.src = URL.createObjectURL(self.files[0]);
    var array = [];
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var pro = document.querySelector('#progress');
    let progressBar = this.progressBar;
    
    function initCanvas(e) {
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
    }

    function drawFrame(e) {
      // console.log('dur',this.duration, '______', this.currentTime)
      this.pause();
      ctx.drawImage(this, 0, 0);
      /* 
      this will save as a Blob, less memory consumptive than toDataURL
      a polyfill can be found at
      https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
      */
      canvas.toBlob(saveFrame, 'image/jpeg');
      let progress = ((this.currentTime / this.duration) * 100).toFixed(2)
      pro.innerHTML = progress + ' %';
      progressBar.style.width = progress + '%';
      // pro.innerHTML = this.duration + '____________' + this.currentTime;
      if (this.currentTime < this.duration) {
        this.play();
      }
      if(((this.currentTime / this.duration) * 100).toFixed(2) == '100.00' && !bool){
        bool = true;
        onend('e')
      }
    }
    function saveFrame(blob) {
      array.push(blob);
    }
    function revokeURL(e) {
      URL.revokeObjectURL(this.src);
    }
    function onend(e) {
      const audiostrip = document.getElementsByClassName('audiostrip')[0];
      audiostrip.classList.add("viewable")
      // const framesToRender = [];
      const num = Math.floor(array.length/8);
      const container = document.getElementsByClassName('frame-container')[0];
      // console.log('container i s', container, 'array is ', array)
      let counter = 0;
      for (var i = 0; i < array.length; i++) {
        if(i % num !== 0){
          continue
        }
        if(counter < 8){
          counter++
        } else {
          return
        }
        let img = new Image();
        img.width = container.clientWidth/8
        img.height = 150
        img.onload = revokeURL;
        // img.classList.add("border-top-red")
        // img.setAttribute("style", "border-top: 4px solid blue")
        // img.style = "border-top: 5px solid red"
        // img.border = '5px solid red'
        img.src = URL.createObjectURL(array[i]);
        container.appendChild(img);
        img.addEventListener('mouseover', function(){
          if(that.frameSelected) return;
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
          // if(!that.selectMode) return;
          if(!that.frameSelected){
            this.setAttribute("style", "border-top: 4px solid blue")
            that.frameSelected = true;
            that.boundingCanvasInit();
          }
        })
      }
      // we don't need the video's objectURL anymore
      URL.revokeObjectURL(self.src);
      //clear the array and video
      array = [];
      // video.removeEventListener('loadedmetadata', initCanvas, false);
      // video.removeEventListener('ended', onend, false);
      // video.removeEventListener('timeupdate', drawFrame, false);
    };
    video.muted = true;
    console.log('vid is ', video)
    video.addEventListener('loadedmetadata', initCanvas, false);
    video.addEventListener('timeupdate', drawFrame, false);
    // video.addEventListener('ended', onend, false);
    video.play();
  }
  // boundingCanvasInit(){
  //   this.boundingCanvas =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
  //   this.ctx = this.boundingCanvas.getContext('2d');
  // }
  mouseMove(e) {
    if (this.drag) {
      var rect = this.boundingCanvas.getBoundingClientRect();
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
    this.drag = true;
    this.cropping = true;
  }
  mouseUp(e) {
    this.drag = false;
    if(this.cropping){
      var rect = this.boundingCanvas.getBoundingClientRect();
      this.rect.endX = e.clientX - rect.left;
      this.rect.endY = e.clientY - rect.top;
      this.readyToCrop = true;
      this.selectMode = false;
      // this.dataTransfer.passData('top', this.rect)
      this.selectMode = false;
    }
  }
  draw(){
    this.ctx.strokeStyle = "#FFFFFF"
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
}
