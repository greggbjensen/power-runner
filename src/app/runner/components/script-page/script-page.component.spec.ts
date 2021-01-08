import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScriptPageComponent } from './script-page.component';

describe('ScriptPageComponent', () => {
  let component: ScriptPageComponent;
  let fixture: ComponentFixture<ScriptPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
