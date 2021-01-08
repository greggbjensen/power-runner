import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScriptTreeComponent } from './script-tree.component';

describe('ScriptTreeComponent', () => {
  let component: ScriptTreeComponent;
  let fixture: ComponentFixture<ScriptTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
