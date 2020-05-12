import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
 


import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { ReportUploaderComponent } from './report-uploader/report-uploader.component';
import { ParametersComponent } from './parameters/parameters.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ReportUploaderComponent,
    ParametersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
