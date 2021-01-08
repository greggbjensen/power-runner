import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SettingsPaneComponent } from './settings-pane.component';

describe('SettingsPaneComponent', () => {
  let component: SettingsPaneComponent;
  let fixture: ComponentFixture<SettingsPaneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
