import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptTabsContainerComponent } from './script-tabs-container.component';

describe('ScriptTabsContainerComponent', () => {
  let component: ScriptTabsContainerComponent;
  let fixture: ComponentFixture<ScriptTabsContainerComponent>;

  beforeEach(async(() => {
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
