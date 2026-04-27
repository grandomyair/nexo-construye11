import { TestBed } from '@angular/core/testing';

import { EstadosApi } from './estados-api';

describe('EstadosApi', () => {
  let service: EstadosApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadosApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
