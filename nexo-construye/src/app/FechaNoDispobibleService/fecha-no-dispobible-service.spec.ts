import { TestBed } from '@angular/core/testing';

import { FechaNoDispobibleService } from './fecha-no-dispobible-service';

describe('FechaNoDispobibleService', () => {
  let service: FechaNoDispobibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FechaNoDispobibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
