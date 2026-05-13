import { TestBed } from '@angular/core/testing';

import { Companyservice } from './companyservice';

describe('Companyservice', () => {
  let service: Companyservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Companyservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
