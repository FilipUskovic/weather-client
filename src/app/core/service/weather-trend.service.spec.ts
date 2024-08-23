import { TestBed } from '@angular/core/testing';

import { WeatherTrendService } from './weather-trend.service';

describe('WeatherTrendService', () => {
  let service: WeatherTrendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherTrendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
