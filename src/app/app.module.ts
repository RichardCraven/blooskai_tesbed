import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TopPanelComponent } from './top-panel/top-panel.component';
import { MidPanelComponent } from './mid-panel/mid-panel.component';
import { BotPanelComponent } from './bot-panel/bot-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    TopPanelComponent,
    MidPanelComponent,
    BotPanelComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
