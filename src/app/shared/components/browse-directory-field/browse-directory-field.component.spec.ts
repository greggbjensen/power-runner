import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseDirectoryFieldComponent } from './browse-directory-field.component';

describe('BrowseDirectoryFieldComponent', () => {
  let component: BrowseDirectoryFieldComponent;
  let fixture: ComponentFixture<BrowseDirectoryFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseDirectoryFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseDirectoryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
