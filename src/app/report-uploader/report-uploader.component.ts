import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-report-uploader',
  templateUrl: './report-uploader.component.html',
  styleUrls: ['./report-uploader.component.css']
})
export class ReportUploaderComponent implements OnInit {

  public fileName: string = "Upload a .csv file";

  @Output() content: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public changeListener(files: FileList){
    if(files && files.length > 0) {
       let file : File = files.item(0);
          if (file.type !== 'text/csv') {
            alert('You must upload a CSV file.');
            return;
          }
         this.fileName = file.name;
         let reader: FileReader = new FileReader();
         reader.readAsText(file);
         reader.onload = (e) => {
            const content = reader.result as string;
            this.content.emit(content);
         }
      }
  }

}
