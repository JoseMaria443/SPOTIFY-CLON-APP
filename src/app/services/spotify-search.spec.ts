import { TestBed } from '@angular/core/testing';

import { SpotifySearch } from './spotify-search';

describe('SpotifySearch', () => {
  let service: SpotifySearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifySearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
