import { TestBed } from '@angular/core/testing';

import { ReseñaService } from './reseña-service';

describe('ReseñaService', () => {
  let service: ReseñaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReseñaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
