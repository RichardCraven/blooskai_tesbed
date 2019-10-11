import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { GetFramesService } from '../services/get-frames.service';

interface ApiUploadResult {
  url: string;
}

export interface UploadResult {
  name: string;
  type: string;
  size: number;
  url: string;
}

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
  frame_container: any;
  frameStrips = [];


  thumbnailCounter = 0;

  // SERVER_URL = 'http://18.221.93.226:5500/train'
  SERVER_URL = 'http://13.59.126.171:5500/train'

  uploadForm: FormGroup; 

  uploading = false;
  selectedFrameSrc: any;
  selectedFrameId: string;
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

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };
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
    console.log('upload page init')
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
    const file = this.uploadForm.get('profile').value;
    this.httpClient.post<any>(this.SERVER_URL, file).subscribe(
      (res) => console.log('res is ', res),
      (err) => console.log('error is ', err)
    );
    return
    const that = this;
    upload();
    function upload() {
      // $( "#progress" ).empty();
      // $( "#uploadresult" ).empty();
      
      // take the file from the input
      // var file = document.getElementById('fileInput').files[0];
      // console.log('file is ', file)
      console.log('file is ', file)

        var reader = new FileReader();
        reader.readAsBinaryString(file); // alternatively you can use readAsDataURL
        reader.onloadend  = function(evt)
        {
            
            // create XHR instance
            let xhr = new XMLHttpRequest();
    
            // send the file through POST
            xhr.open("POST", that.SERVER_URL);
            // xhr.setRequestHeader('X-Filename', file.name);

            xhr.onload = function (oEvent) {
              // Uploaded.
              console.log('loaded')
            };
            
            // var blob = new Blob(['test123'], {type: 'text/plain'});
            
            xhr.onprogress = function (e) {
              console.log('$$:: ', e.loaded, ' / ', e.total)
            };
            
            xhr.send(file);

            console.log('this: ', this, 'evt is ', evt)

            // make sure we have the sendAsBinary method on all browsers
            // XMLHttpRequest.prototype.mySendAsBinary = function(text){
            //     var data = new ArrayBuffer(text.length);
            //     var ui8a = new Uint8Array(data, 0);
            //     for (var i = 0; i < text.length; i++) ui8a[i] = (text.charCodeAt(i) & 0xff);
    
            //     if(typeof window.Blob == "function")
            //     {
            //         var blob = new Blob([data]);
            //     }else{
            //         var bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder)();
            //         bb.append(data);
            //         var blob = bb.getBlob();
            //     }
    
            //     this.send(blob);
            // }
    
            
    
            // state change observer - we need to know when and if the file was successfully uploaded
            // xhr.onreadystatechange = function()
            // {
            //     if(xhr.readyState == 4)
            //     {
            //         if(xhr.status == 200)
            //         {
            //             // process success
            //             $( "#uploadresult" ).empty().append( 'Uploaded Ok');
            //         }else{
            //             // process error
            //             $( "#uploadresult" ).empty().append( 'Uploaded Failed');
            //         }
            //     }
            // };
    
            // start sending
            // xhr.mySendAsBinary(evt.target.result);
        };
    }
  }
  beginUpload(){
    this.uploading = true;
    const that = this;
    setTimeout(function(){
      that.boundingCanvasInit();
    })
  }
  boundingCanvasInit(){

    this.boundingCanvas =  document.getElementById('hd-bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');

    this.boundingCanvas.style.zIndex = '10'
  }
  setBoundingCanvasDimensions(height){
    height === 720 ? this.setDimensions = {
      height: 720,
      width: 1280
    } : this.setDimensions = {
      height: 1080,
      width: 1920
    }
    //to potentially manually reset the canvas dimensions
  }
  insertFrames(src){
    const that = this;
    // this.uploading = true;
    // setTimeout(() => {
    //   this.boundingCanvasInit()
    //   this.getFramesService.getEm()
    // })

    //Retrieve all the files from the FileList object
    this.uploading = true;
    let files = src.target.files; 
    // const files = this.getFramesService.getEm();
    setTimeout(() => {
      this.boundingCanvasInit()

      console.log('files length is ', files.length)
      // const stripContainer = document.getElementsByClassName('framestrip-container')[0]
      // let frameContainer = document.createElement("div")
      // frameContainer.classList.add('frame-container')
      // stripContainer.appendChild(frameContainer);
      // frameContainer.style.width = '1920px'
      // this.frame_container = document.getElementById('frame-container')
      const paneContainer = document.getElementsByClassName('preview-pane-container')[0];
      let counter = 0;
      this.frameStrips = [[]]
      for(let i = 0; i < files.length; i++ ){
        if(this.frameStrips[counter].length >= 12){
          this.frameStrips.push([]);
          counter++
        }
        let imgSrc = this.getImgSrc(files[i])
        this.frameStrips[counter].push({
          imgSrc: imgSrc,
          id: i
        });
      }
      console.log('framestrips are ', this.frameStrips)

      setTimeout(() => {
       const frameStrips = document.getElementsByClassName('frame-strip') as HTMLCollectionOf<HTMLElement>
       Array.from(frameStrips).forEach( (strip, index) => {
         let frames = strip.children as HTMLCollectionOf<HTMLElement>
          for(let i = 0; i < frames.length; i++){
            let imgSrc = this.frameStrips[index][i].imgSrc
            frames[i].style.backgroundImage = 'url('+ imgSrc +')';

            frames[i].addEventListener('mouseover', function(){
              if(!that.frameSelected){
                that.selectedImgSrc = imgSrc;
                that.selectedFrameId = that.frameStrips[index][i].id;
                paneContainer.innerHTML = '';
                let paneImage = new Image();
                paneImage.height = paneContainer.clientHeight;
                paneImage.width = paneContainer.clientWidth;
                paneImage.src = imgSrc;
                paneContainer.appendChild(paneImage);
              }
            })

            frames[i].addEventListener('mousedown', function(){
              that.clearSelectedFrames()
              that.frameSelected = true;
              // HTMLElement.set
              // this.setAttribute("style", "border: 2px solid blue")
              this.classList.add('selectedFrame')
              console.log('this is ', this)
          })
          }
        //  Array.from(strip.children).forEach(element => {
        //    element.style.backgroundColor = 'red'
        //  });
       })
      })

      // if (files) {
      //   for(let i = 0; i < files.length; i++) {
      //     this.insertFrame(files[i]);
      //   }
      // } else {
      //       alert("Failed to load files"); 
      // }
    })
  }
  clearSelectedFrames() {
    const frameStrips = document.getElementsByClassName('frame-strip') as HTMLCollectionOf<HTMLElement>
       Array.from(frameStrips).forEach( (strip, index) => {
         let frames = strip.children as HTMLCollectionOf<HTMLElement>
          for(let i = 0; i < frames.length; i++){
            frames[i].classList.remove('selectedFrame')
          }
       });
  }
  getImgSrc (file: any) {
    return URL.createObjectURL(file);
  }
  insertFrame(file: any){
    const that = this;
    var imgSrc = URL.createObjectURL(file);
    
    const frames = document.getElementsByClassName('dynamicFrames') as HTMLCollectionOf<HTMLElement>;  

    frames[this.incrementer].style.backgroundImage = "url(" + imgSrc + ")"; 
    frames[this.incrementer].style.backgroundSize = "100% 100%"
    frames[this.incrementer].style.backgroundRepeat = "no-repeat"
    

    let img = new Image();
    img.src = imgSrc;


    let paneContainer = document.getElementsByClassName('preview-pane-container')[0];
    frames[this.incrementer].addEventListener('mouseover', function(){
      that.selectedImgSrc = imgSrc;
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
    this.ctx.clearRect(0,0,this.boundingCanvas.width,this.boundingCanvas.height);
    this.imgObj = new Image(1920, 1080);
    this.imgObj.src = this.selectedImgSrc;
    const that = this;
    this.imgObj.onload = function(){
      that.onPreloadComplete()
    };
  }
  onPreloadComplete(){
    const thumbnail = new Image(1920, 1080);

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');
    console.log('this.rect is ', this.rect)
    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 1);
    thumbnail.src = newImgSrc;
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
    bufferContext.drawImage(imgObj, 0, 0, 1920, 1078);
    console.log('ID IS ', this.selectedFrameId)
    if(!this.switch && !this.third){
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);


      const coordinates = <HTMLElement> document.getElementById('coord-div1')
      coordinates.innerHTML = 'id: ' + this.selectedFrameId + 
      '<br/>' + 
      'start X: ' + this.rect.startX +  '<br/>' +  
      ' start Y: ' + this.rect.startY + '<br/>' +  
      ' end X: ' + this.rect.endX + '<br/>' +  
      ' end Y: ' + this.rect.endY
      
      this.switch = true;
    } else if(this.switch && !this.third) {
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas2')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);

      const coordinates = <HTMLElement> document.getElementById('coord-div2')
      coordinates.innerHTML = 'id: ' + this.selectedFrameId + 
      '<br/>' + 
      'start X: ' + this.rect.startX +  '<br/>' +  
      ' start Y: ' + this.rect.startY + '<br/>' +  
      ' end X: ' + this.rect.endX + '<br/>' +  
      ' end Y: ' + this.rect.endY
      this.third = true;
    } else {
      const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas3')
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);

      const coordinates = <HTMLElement> document.getElementById('coord-div3')
      coordinates.innerHTML = 'id: ' + this.selectedFrameId + 
      '<br/>' + 
      'start X: ' + this.rect.startX +  '<br/>' +  
      ' start Y: ' + this.rect.startY + '<br/>' +  
      ' end X: ' + this.rect.endX + '<br/>' +  
      ' end Y: ' + this.rect.endY
    }
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    return tnCanvas.toDataURL();
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
    this.drag = true;
    this.cropping = true;
  }
  mouseUp(e) {
    this.drag = false;
    this.readyToCrop = true;

    if(this.cropping){
      var rect = this.boundingCanvas.getBoundingClientRect();
      this.rect.endX = e.clientX - rect.left;
      this.rect.endY = e.clientY - rect.top;
      this.readyToCrop = true;
      this.selectMode = false;
      this.selectMode = false;
      this.frameSelected = false;
    }
  }
  draw(){
    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
}
