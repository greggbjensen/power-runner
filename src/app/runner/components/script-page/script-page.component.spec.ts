import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptPageComponent } from './script-page.component';

describe('ScriptPageComponent', () => {
  let component: ScriptPageComponent;
  let fixture: ComponentFixture<ScriptPageComponent>;

  beforeEach(async(() => {
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
