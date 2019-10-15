import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GetFramesService } from '../services/get-frames.service';

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

  insertFramesSwitch = false;

  thumbnailCounter = 0;

  // SERVER_URL = 'http://18.221.93.226:5500/train'
  // SERVER_URL = 'http://13.59.126.171:5500/train'
  SERVER_URL = 'http://3.15.139.228:5500'

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

  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient, private getFramesService: GetFramesService) { }

  ngOnInit() {
    this.getFramesService.getFrames().subscribe(res => {
      this.insertFrames(res);
    });


    this.httpClient.get(this.SERVER_URL).subscribe(data => {
      console.log('get response is ', data);
    });



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
    console.log('posting file: ', file)
    this.httpClient.post<any>(this.SERVER_URL + '/train', formData).subscribe(
      (res) => {
        console.log('SUCCESS! res is ', res)
        this.getFramesService.getEm()
        // this.insertFrames();
    },
      (err) => console.log('error is ', err)
    );
  }
  // beginUpload(){
  //   this.uploading = true;
  //   const that = this;
  //   setTimeout(function(){
  //     that.boundingCanvasInit();
  //     that.insertFrames();
  //   })
  // }
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
  }
  insertFrames (filesArr) {
    console.log('in insertFrames')
    // if(this.insertFramesSwitch) return
    // this.insertFramesSwitch = true;
    // console.log('filesArr is ', filesArr)
    const that = this;
    //Retrieve all the files from the FileList object
    this.uploading = true;
    // let files = src.target.files; 
    let files = filesArr
    
    setTimeout(() => {
      const audiostrip = document.getElementsByClassName('audiostrip')[0];
      audiostrip.classList.add('viewable')
      this.boundingCanvasInit()
      const paneContainer = document.getElementsByClassName('preview-pane-container')[0];
      let counter = 0;
      this.frameStrips = [[]]
      for(let i = 0; i < filesArr.length; i++ ){
      // for(let i = 0; i < 10; i++ ){ 
        if(this.frameStrips[counter].length >= 12){
          this.frameStrips.push([]);
          counter++
        }
        // let imgSrc = this.getImgSrc(filesArr[i])
        let imgSrc = filesArr[i];
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
             var img = new Image();
             img.src = imgSrc;

             frames[i].style.backgroundImage = "url('" + img.src + "')"

            //  frames[i].style.backgroundImage = "url('"+ imgSrc +"')";


            // frames[i].style.backgroundImage = "url('data:image/png;base64, "+imgSrc + "')";
             frames[i].style.backgroundSize = '100% 100%';
             frames[i].style.backgroundRepeat = 'no-repeat';
            //  frames[i].style.backgroundColor = 'blue'
 
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








      return
        // newFrames.array.forEach(element => {
          
        // });

      //  Array.from(frameStrips).forEach( (strip, index) => {


        // for(let i = 0; i < frames.length; i++){
          
          const frames = document.getElementsByClassName('dynamicFrame') as HTMLCollection;
           console.log('nowww frames are ', frames)
          //  console.log(' frame 3 is ', frames[2])
          //  var list = document.getElementsByClassName("events");
          //   for (let item of list) {
          //       console.log(item.id);
          //   }
          //  for(let i = 0; i < 10; i++){ 
            for (let i = 0; i < frames.length; i++) {
              console.log('i is ', i);
              
              let el = frames.item(i) as HTMLElement;
              el.style.backgroundSize = '100% 100%';
              el.style.backgroundColor = 'red';

              // el.addEventListener('mouseover', function(){
              //   if(!that.frameSelected){
              //     that.selectedImgSrc = imgSrc;
              //     that.selectedFrameId = that.frameStrips[0][i].id;
              //     paneContainer.innerHTML = '';
              //     let paneImage = new Image();
              //     paneImage.height = paneContainer.clientHeight;
              //     paneImage.width = paneContainer.clientWidth;
              //     paneImage.src = imgSrc;
              //     paneContainer.appendChild(paneImage);
              //   }
              // })

              el.addEventListener('mousedown', function(){
                that.clearSelectedFrames()
                that.frameSelected = true;
                this.classList.add('selectedFrame')
              })
            }
              // console.log(i)
              // let imgSrc = this.frameStrips[0][i].imgSrc;
              // console.log('frame is ', frames[i])
              
              // let el = frames[i] as HTMLElement
              // el.style.backgroundSize = '100% 100%';
              // el.style.backgroundColor = 'red';
              // frames[i].style.backgroundImage = 'url('+ imgSrc +')';

            // el.addEventListener('mouseover', function(){
            //   if(!that.frameSelected){
            //     that.selectedImgSrc = imgSrc;
            //     that.selectedFrameId = that.frameStrips[0][i].id;
            //     paneContainer.innerHTML = '';
            //     let paneImage = new Image();
            //     paneImage.height = paneContainer.clientHeight;
            //     paneImage.width = paneContainer.clientWidth;
            //     paneImage.src = imgSrc;
            //     paneContainer.appendChild(paneImage);
            //   }
            // })

            
          
      //  })
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
    // if(){
      if (this.drag) {
        var rect = this.boundingCanvas.getBoundingClientRect();
        this.rect.w = (e.clientX - rect.left) - this.rect.startX;
        this.rect.h = (e.clientY - rect.top) - this.rect.startY ;
        this.ctx.clearRect(0,0,this.boundingCanvas.width,this.boundingCanvas.height);
        this.draw();
      }
    // }
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
