import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css']
})
export class UploadPageComponent implements OnInit {
  content = [];
  progressBar: any;
  resolution1080 = true;

  switch = false;
  third = false;


  thumbnailCounter = 0;

  SERVER_URL = 'http://18.222.224.237:5500/'
  // SERVER_URL = 'https://jsonplaceholder.typicode.com/posts/1'
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

  selectedImgSrc: any;
  incrementer = 0;

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
    // console.log('initting')
    
    // this.httpClient.get(this.SERVER_URL).subscribe(data => {
    //   console.log(data);
    // });
    





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
      console.log('upload form is now ', this.uploadForm)
    }
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);

    const headers = new HttpHeaders()
             .set('cache-control', 'no-cache')
             .set('content-type', 'application/json')

    this.httpClient.post<any>(this.SERVER_URL, formData, {headers}).subscribe(
      (res) => console.log('res is ', res),
      (err) => console.log(err)
    );

    // fetch('https://jsonplaceholder.typicode.com/posts', {
    // method: 'POST',
    // body: JSON.stringify({
    //   title: 'foo',
    //   body: 'bar',
    //   userId: 1
    // }),
    // headers: {
    //   "Content-type": "application/json; charset=UTF-8"
    // }
    // })
    // .then(response => response.json())
    // .then(json => console.log(json))

    // return this.httpClient.get(this.SERVER_URL);
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

    // this.thumbnailArr[0].canvas = document.getElementById('thumbnail-canvas0') as HTMLCanvasElement;
    // this.thumbnailArr[0].context = this.thumbnailArr[0].canvas.getContext('2d');
    // this.thumbnailArr[1].canvas = document.getElementById('thumbnail-canvas1') as HTMLCanvasElement;
    // this.thumbnailArr[1].context = this.thumbnailArr[1].canvas.getContext('2d');
    // this.thumbnailArr[2].canvas = document.getElementById('thumbnail-canvas2') as HTMLCanvasElement;
    // this.thumbnailArr[2].context = this.thumbnailArr[2].canvas.getContext('2d');

    // this.copyCanvas = <HTMLCanvasElement> document.getElementById('copy-canvas');
    // this.copyCtx = this.copyCanvas.getContext('2d');

    this.boundingCanvas.style.zIndex = '10'
    // console.log('initting bounding canvas as ', this.boundingCanvas, 'copy canvas is ', this.copyCanvas)

    // const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas1')
    // const ctx = canvas.getContext('2d');
  }
  setBoundingCanvasDimensions(height){
    // console.log('in set dimensions, height is ', height);
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
    // console.log('cropped. img obj is ', this.imgObj)
  }

  insertFrames(src){
    
    //Retrieve all the files from the FileList object
    this.uploading = true;
    let files = src.target.files; 
    setTimeout(() => {
      this.boundingCanvasInit()
      if (files) {
        for(let i = 0; i < files.length; i++) {
          this.insertFrame(files[i]);
        }
      } else {
            alert("Failed to load files"); 
      }
    })
  }
  insertFrame(file){
    
    const that = this;
    console.log('inserting', 'file is', file , 'incrementer is ', this.incrementer)
    var imgSrc = URL.createObjectURL(file);
    
    const frames = document.getElementsByClassName('frame') as HTMLCollectionOf<HTMLElement>;  
    // setTimeout(function(){
    //   console.log('frames are', frames, frames[0])
    //   frames[that.incrementer].style.backgroundImage = "url(" + imgSrc + ")"; 
    //   frames[that.incrementer].style.backgroundSize = "100% 100%"
    //   frames[that.incrementer].style.backgroundRepeat = "no-repeat"
    // })

    // return
    console.log('frames are', frames, frames[0])
    frames[this.incrementer].style.backgroundImage = "url(" + imgSrc + ")"; 
    frames[this.incrementer].style.backgroundSize = "100% 100%"
    frames[this.incrementer].style.backgroundRepeat = "no-repeat"
    

    let img = new Image();
    img.src = imgSrc;


    let paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    frames[this.incrementer].addEventListener('mouseover', function(){
      that.selectedImgSrc = imgSrc;
      // if(that.frameSelected) return;
      paneContainer.innerHTML = '';
      let paneImage = new Image();
      paneImage.height = paneContainer.clientHeight;
      paneImage.width = paneContainer.clientWidth;
      paneImage.src = imgSrc;
      paneContainer.appendChild(paneImage);
    })
    img.addEventListener('mousedown', function(){
        this.setAttribute("style", "border-top: 4px solid blue")
    })
    this.incrementer ++;
  }
  initiateCrop(src){
    this.imgObj = new Image(625, 625);
    this.imgObj.src = this.selectedImgSrc;
    const that = this;
    this.imgObj.onload = function(){
      that.onPreloadComplete()
    };
  }
  onPreloadComplete(){
    const thumbnail = new Image(625, 625);

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');

    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 1);
    thumbnail.src = newImgSrc;
    console.log('thumbnail is ', thumbnail)
    ctx.drawImage(thumbnail, 0, 0)
  }
  getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio){
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth; 
    tnCanvas.height = newHeight;
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0, 625, 625);
    
    if(!this.switch && !this.third){
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);
      this.switch = true;
    } else if(this.switch && !this.third) {
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas2')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);
      this.third = true;
    } else {
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas3')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);
    }
    this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    return tnCanvas.toDataURL();
   }

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
}
