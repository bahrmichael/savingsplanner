import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUploaderComponent } from './report-uploader.component';

describe('ReportUploaderComponent', () => {
  let component: ReportUploaderComponent;
  let fixture: ComponentFixture<ReportUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
