import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppUpdateDialogComponent } from './app-update-dialog.component';

describe('AppUpdateDialogComponent', () => {
  let component: AppUpdateDialogComponent;
  let fixture: ComponentFixture<AppUpdateDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
