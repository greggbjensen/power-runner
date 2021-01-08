import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScriptLogComponent } from './script-log.component';

describe('ScriptLogComponent', () => {
  let component: ScriptLogComponent;
  let fixture: ComponentFixture<ScriptLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
