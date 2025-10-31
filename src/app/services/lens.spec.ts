import { TestBed } from '@angular/core/testing';

import { Lens } from './lens';

describe('Lens', () => {
  let service: Lens;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lens);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
