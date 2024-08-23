import {Component, ElementRef, Input, SimpleChanges, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartType} from "chart.js";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-chart-component',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './chart-component.component.html',
  styleUrl: './chart-component.component.scss'
})
export class ChartComponentComponent {
  @Input() weatherData: any;
  @Input() chartType: 'hourly' | 'daily' = 'hourly';
  @ViewChild('chart', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | undefined;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['weatherData'] && this.weatherData) {
      this.updateChart();
    }
  }

  private updateChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.weatherData.time.map((time: string) =>
      this.chartType === 'hourly'
        ? new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : new Date(time).toLocaleDateString()
    );

    const datasets = [
      {
        type: 'bar' as ChartType,
        label: this.chartType === 'hourly' ? 'Temperature (°C)' : 'Max Temperature (°C)',
        data: this.chartType === 'hourly' ? this.weatherData.temperature2m : this.weatherData.temperatureMax,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        type: 'bar' as ChartType,
        label: this.chartType === 'hourly' ? 'Feels Like (°C)' : 'Min Temperature (°C)',
        data: this.chartType === 'hourly' ? this.weatherData.feelsLike : this.weatherData.temperatureMin,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        type: 'line' as ChartType,
        label: 'Humidity (%)',
        data: this.weatherData.relativeHumidity2m,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ];

    // Add additional datasets for hourly and daily forecasts
    if (this.chartType === 'hourly') {
      datasets.push({
        type: 'line' as ChartType,
        label: 'Wind Speed (m/s)',
        data: this.weatherData.windspeed10m,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
        yAxisID: 'y2'
      });
    } else if (this.chartType === 'daily') {
      datasets.push({
        type: 'line' as ChartType,
        label: 'UV Index',
        data: this.weatherData.uvIndex,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
        yAxisID: 'y2'
      });
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: { labels, datasets },
      options: {
        responsive: true,
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            title: { display: true, text: 'Temperature (°C)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Humidity (%)' },
            grid: { drawOnChartArea: false }
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: this.chartType === 'hourly' ? 'Wind Speed (m/s)' : 'UV Index'
            },
            grid: { drawOnChartArea: false }
          }
        },
        plugins: {
          title: {
            display: true,
            text: this.chartType === 'hourly' ? 'Hourly Weather Forecast' : 'Daily Weather Forecast'
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}
