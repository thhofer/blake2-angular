import { TestBed, inject } from '@angular/core/testing';

import { Blake2sService } from './blake2s.service';

describe('Blake2sService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Blake2sService]
    });
  });

  it('should be created', inject([Blake2sService], (service: Blake2sService) => {
    expect(service).toBeTruthy();
  }));
});
