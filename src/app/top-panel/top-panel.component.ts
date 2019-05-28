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
  rect = {
    startX : undefined,
    startY : undefined,
    endX: undefined,
    endY: undefined,
    h : 0,
    w : 0
  };
  constructor(private dataTransfer: DataTransferService) { }

  ngOnInit() {
    console.log(this.dataTransfer)
    this.subscription = this.dataTransfer.getData().subscribe(res => {
      if(res.destination !== 'top') return;
      this.rect = res.data
      console.log('received rect', this.rect)
    })
    this.copyCanvas = <HTMLCanvasElement> document.getElementById('copy-canvas');
    this.copyCtx = this.copyCanvas.getContext('2d');
  }
  initiateCrop(src){
    console.log('initiating crop');
    // console.log('kkk',this.selectedFrameSrc, this.selectMode, this.readyToCrop)
    // if(this.selectMode || !this.readyToCrop ) return
    this.imgObj = new Image(625, 625);
    this.imgObj.src = '../../../assets/sample.png'
    const that = this;
    this.imgObj.onload = function(){
      that.onPreloadComplete()
    };
  }
  onPreloadComplete(){
    // this.copyCtx.drawImage(this.imgObj, 0, 0, 625, 625)
    // return
    
    const thumbnail = new Image(625, 625);

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');

    var newImgSrc = this.getImagePortion(this.imgObj, this.rect.w, this.rect.h, this.rect.startX, this.rect.startY, 1);
    thumbnail.src = newImgSrc;
    console.log('thumbnail is ', thumbnail)
    ctx.drawImage(thumbnail, 0, 0)
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
    

    const canvas = <HTMLCanvasElement> document.getElementById('thumbnail-canvas')
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, 0, 0, 300, 300);
    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    // this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    this.copyCtx.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);
    tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight, startX, startY, newWidth, newHeight);

    return tnCanvas.toDataURL();
   }
}
