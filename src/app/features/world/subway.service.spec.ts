import { TestBed } from '@angular/core/testing';

import { SubwayService } from './subway.service';

describe('SubwayService', () => {
  let service: SubwayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubwayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
