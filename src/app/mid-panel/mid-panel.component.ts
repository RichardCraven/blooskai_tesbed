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
    this.boundingCanvasInit();
    
    this.thumbnailContainer = document.getElementsByClassName('captured-thumbnail')[0];

    this.subscription = this.dataTransfer.getData().subscribe(res => {
      if(res.destination !== 'mid') return;
      console.log('mid receiving data with type ', typeof res.data);
      res.destination === 'mid' && console.log('receiving data, data is ', res.data)
      if(typeof res.data === 'string'){
        this.selectMode = !this.selectMode;
      }
    })
  }
  boundingCanvasInit(){
    this.boundingCanvas =  document.getElementById('bounding-canvas') as HTMLCanvasElement;
    this.ctx = this.boundingCanvas.getContext('2d');
  }
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
      this.dataTransfer.passData('top', this.rect)
      this.selectMode = false;
    }
  }
  draw(){
    this.ctx.strokeStyle = "#FFFFFF"
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
  }
}
