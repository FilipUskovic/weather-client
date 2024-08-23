import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherTrendComponent } from './weather-trend.component';

describe('WeatherTrendComponent', () => {
  let component: WeatherTrendComponent;
  let fixture: ComponentFixture<WeatherTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
