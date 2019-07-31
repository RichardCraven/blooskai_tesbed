import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TopPanelComponent } from './top-panel/top-panel.component';
import { MidPanelComponent } from './mid-panel/mid-panel.component';
import { BotPanelComponent } from './bot-panel/bot-panel.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { UploadComponent } from './upload/upload.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { UploadPageComponent } from './upload-page/upload-page.component';
import { ReactiveFormsModule } from '@angular/forms';


const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'upload', component: UploadPageComponent },
  { path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // { path: '**', component: PageNotFoundComponent }
];



@NgModule({
  declarations: [
    AppComponent,
    TopPanelComponent,
    MidPanelComponent,
    BotPanelComponent,
    UploadComponent,
    DashboardComponent,
    SidePanelComponent,
    SearchBarComponent,
    UploadPageComponent
  ],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    ButtonsModule,
    BrowserAnimationsModule,
    UploadModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
