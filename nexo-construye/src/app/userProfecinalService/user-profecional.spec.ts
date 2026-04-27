import { TestBed } from '@angular/core/testing';

import { UserProfecional } from './user-profecional';

describe('UserProfecional', () => {
  let service: UserProfecional;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfecional);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
