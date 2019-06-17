import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit {
  selectedRoute = 'dashboard';
  constructor() { }

  ngOnInit() {
  }

}
