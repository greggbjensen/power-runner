import { TestBed } from '@angular/core/testing';

import { NodeScriptCacheService } from './node-script-cache.service';

describe('NodeScriptCacheService', () => {
  let service: NodeScriptCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeScriptCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
