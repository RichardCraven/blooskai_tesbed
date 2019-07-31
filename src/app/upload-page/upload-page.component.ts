import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css']
})
export class UploadPageComponent implements OnInit {
  content = [];
  progressBar: any;
  resolution1080 = true;

  SERVER_URL = 'localhost:3000'
  uploadForm;

  uploading = false;
  selectedFrameSrc: any;
  imgObj: any;
  paneContainer: any;
  frameSelected = false;

  setDimensions = {
    height: 1080,
    width: 1920
  }

  thumbnailArr = [];

  thumbnail1 = {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  }
  thumbnail2 = {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  }
  thumbnail3 = {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  }
  thumbnailCounter = 0;


  // Below are props from mid panel
  boundingCanvas: HTMLCanvasElement;
  ctx: any;

  copyCanvas: HTMLCanvasElement;
  copyCtx: any;

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

  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit() {
    console.log('in init');
    this.thumbnailArr.push(this.thumbnail1, this.thumbnail2, this.thumbnail3)
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

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
  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('profile').setValue(file);
    }
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);

    this.httpClient.post<any>(this.SERVER_URL, formData).subscribe(
      (res) => console.log(res),
      (err) => console.log(err)
    );
  }
  beginUpload(){
    this.uploading = true;
    const that = this;
    setTimeout(function(){
      that.boundingCanvasInit();
    })
  }
  boundingCanvasInit(){

    console.log('thumbnail array is ', this.thumbnailArr)
    // this.thumbnailArr


    this.boundingCanvas =  document.getElementById('hd-bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');

    this.thumbnailArr[0].canvas = document.getElementById('thumbnail-canvas1') as HTMLCanvasElement;
    this.thumbnailArr[0].context = this.thumbnailArr[0].canvas.getContext('2d');
    this.thumbnailArr[1].canvas = document.getElementById('thumbnail-canvas1') as HTMLCanvasElement;
    this.thumbnailArr[1].context = this.thumbnailArr[0].canvas.getContext('2d');
    this.thumbnailArr[2].canvas = document.getElementById('thumbnail-canvas1') as HTMLCanvasElement;
    this.thumbnailArr[2].context = this.thumbnailArr[0].canvas.getContext('2d');

    // this.copyCanvas = <HTMLCanvasElement> document.getElementById('copy-canvas');
    // this.copyCtx = this.copyCanvas.getContext('2d');

    this.boundingCanvas.style.zIndex = '10'
    // console.log('initting bounding canvas as ', this.boundingCanvas, 'copy canvas is ', this.copyCanvas)

    // const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas1')
    // const ctx = canvas.getContext('2d');
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
  
  // initiateCrop(src){
  //   console.log('initiating crop');
  //   this.imgObj = new Image(625, 625);
  //   this.imgObj.src = '../../../assets/sample.png'
  //   const that = this;
  //   this.imgObj.onload = function(){
  //     that.onPreloadComplete()
  //   };
  // }
  crop(){
    console.log('cropped. img obj is ', this.imgObj)
  }
  waitThenExtract(source){
    this.uploading = true;
    this.beginUpload()
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
            console.log('SELECTED FRMAE IS ', that)
          }
        })
        img.addEventListener('mousedown', function(){
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
      // console.log('inside, rect is ', rect);
      this.rect.w = (e.clientX - rect.left) - this.rect.startX;
      this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
      this.ctx.clearRect(0,0,this.boundingCanvas.width,this.boundingCanvas.height);
      this.draw();
    }
  }
  mouseDown(e) {
    console.log('in mousedown', this.boundingCanvas)
    var rect = this.boundingCanvas.getBoundingClientRect();
    this.rect.startX = e.clientX - rect.left;
    this.rect.startY = e.clientY - rect.top;
    this.drag = true;
    this.cropping = true;
  }
  mouseUp(e) {
    this.drag = false;
    this.readyToCrop = true;
    var rect = this.boundingCanvas.getBoundingClientRect();
    this.rect.endX = e.clientX - rect.left;
    this.rect.endY = e.clientY - rect.top;
    console.log('in mouseup', this.readyToCrop)
    if(this.cropping){
      var rect = this.boundingCanvas.getBoundingClientRect();
      this.rect.endX = e.clientX - rect.left;
      this.rect.endY = e.clientY - rect.top;
      this.readyToCrop = true;
      this.selectMode = false;
      this.selectMode = false;

    }
  }
  draw(){
    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }

  ///FROM PREVIOUS ITERATION

  initiateCrop(){
    console.log('initiating crop');
    this.imgObj = new Image(this.setDimensions.height, this.setDimensions.width);
    this.imgObj.src = this.selectedFrameSrc
    const that = this;
    this.imgObj.onload = function(){
      // that.crop()
      that.onPreloadComplete()
    };
  }
  
  onPreloadComplete(){
    // this.copyCtx.drawImage(this.imgObj, 0, 0, 625, 625)
    // return
    
    const thumbnail = new Image(300, 300);

    // const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas1')
    // const ctx = canvas.getContext('2d');

    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 1);
    thumbnail.src = newImgSrc;
    console.log('thumbnail is ', thumbnail)
    // ctx.drawImage(thumbnail, 0, 0)
    console.log('about to set context, counter is at ', this.thumbnailCounter)

    this.thumbnailArr[this.thumbnailCounter].context.drawImage(thumbnail, 0, 0)

    this.thumbnailCounter ++





    // document.getElementsByClassName('top-window')[0].appendChild(thumbnail)
    // this.copyCtx.drawImage(thumbnail, 0, 0, 625, 625)
  }
  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio){
    console.log('new w and h : ', newWidth, newHeight)
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
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
    

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas1')
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);

    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    // this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);

    // this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);

    return tnCanvas.toDataURL();
   }
}
