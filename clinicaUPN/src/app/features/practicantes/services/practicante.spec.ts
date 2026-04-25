import { TestBed } from '@angular/core/testing';

import { Practicante } from './practicante';

describe('Practicante', () => {
  let service: Practicante;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Practicante);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
