import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherDasboardComponent } from './weather-dasboard.component';

describe('WeatherDasboardComponent', () => {
  let component: WeatherDasboardComponent;
  let fixture: ComponentFixture<WeatherDasboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherDasboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherDasboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
