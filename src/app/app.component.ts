import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'blooskai-testbed';
  
  
  
  
  
 
  
  
  
  
  // rect: any;
  
  constructor(){
    console.log('constructing')
  }
  ngOnInit(){
    console.log('initializing')
    const el = document.querySelector('input')
    console.log(el)
    
    
  }

  
  
  
  
  
  
  
  
  
}
