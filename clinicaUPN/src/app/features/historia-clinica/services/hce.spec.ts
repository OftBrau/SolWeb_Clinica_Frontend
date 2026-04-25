import { TestBed } from '@angular/core/testing';

import { Hce } from './hce';

describe('Hce', () => {
  let service: Hce;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
