import { TestBed } from '@angular/core/testing';

import { SearchPriceService } from './search-price.service';

describe('SearchPriceService', () => {
  let service: SearchPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
