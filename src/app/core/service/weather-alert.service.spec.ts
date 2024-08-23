import { TestBed } from '@angular/core/testing';

import { WeatherAlertService } from './weather-alert.service';

describe('WeatherAlertService', () => {
  let service: WeatherAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
