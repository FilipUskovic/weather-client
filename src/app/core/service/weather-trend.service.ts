import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeatherTrendService {
  analyzeTrend(data: number[]): string {
    const trend = this.calculateTrend(data);
    if (trend > 0) {
      return 'rising';
    } else if (trend < 0) {
      return 'falling';
    } else {
      return 'stable';
    }
  }

  private calculateTrend(data: number[]): number {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
}
