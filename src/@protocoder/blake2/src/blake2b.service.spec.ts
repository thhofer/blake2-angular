import { inject, TestBed } from '@angular/core/testing';

import { Blake2bService } from './blake2b.service';

describe('Blake2bService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Blake2bService]
    });
  });

  it('should be created', inject([Blake2bService], (service: Blake2bService) => {
    expect(service).toBeTruthy();
  }));

  it('should produce the expected results', inject([Blake2bService], (service: Blake2bService) => {
    expect(service.hashToHex(''))
      .toBe(
        '786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419d25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce');
    expect(service.hashToHex(new Uint8Array([0])))
      .toBe(
        '2fa3f686df876995167e7c2e5d74c4c7b6e48f8068fe0e44208344d480f7904c36963e44115fe3eb2a3ac8694c28bcb4f5a0f3276f2e79487d8219057a506e4b');
  }));
});
