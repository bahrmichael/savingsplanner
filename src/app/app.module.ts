import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
 
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { ReportUploaderComponent } from './report-uploader/report-uploader.component';
import { ParametersComponent } from './parameters/parameters.component';

import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://ac4b00dd1bca43b7bae025756b335e49@o272975.ingest.sentry.io/5238242"
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    Sentry.showReportDialog({ eventId });
  }
}

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
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule { }
