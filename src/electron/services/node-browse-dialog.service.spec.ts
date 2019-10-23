import { TestBed } from '@angular/core/testing';

import { NodeBrowseDialogService } from './node-browse-dialog.service';

describe('NodeBrowseDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NodeBrowseDialogService = TestBed.get(NodeBrowseDialogService);
    expect(service).toBeTruthy();
  });
});
