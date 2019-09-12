import { TestBed } from '@angular/core/testing';

import { NodeProxyFactory } from './node-proxy.factory';

describe('NodeProxyFactory', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NodeProxyFactory = TestBed.get(NodeProxyFactory);
    expect(service).toBeTruthy();
  });
});
