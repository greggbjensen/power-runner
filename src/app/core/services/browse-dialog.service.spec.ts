import { TestBed } from '@angular/core/testing';

import { BrowseDialogService } from './browse-dialog.service';

describe('BrowseDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BrowseDialogService = TestBed.get(BrowseDialogService);
    expect(service).toBeTruthy();
  });
});
