import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScriptTabsContainerComponent } from './script-tabs-container.component';

describe('ScriptTabsContainerComponent', () => {
  let component: ScriptTabsContainerComponent;
  let fixture: ComponentFixture<ScriptTabsContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptTabsContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptTabsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
