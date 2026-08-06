import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

export interface DonutLegendItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart-card',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="chart-card">
      <div class="chart-card__header">
        <div class="chart-card__title-group">
          <div class="chart-card__title">{{ title }}</div>
          <div class="chart-card__subtitle">Click a slice to drill down</div>
        </div>
        <button type="button" class="chart-card__menu" aria-label="More options">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="chart-card__content">
        <div class="chart-wrapper">
          <apx-chart
            [series]="series"
            [chart]="chart"
            [labels]="labels"
            [legend]="legend"
            [dataLabels]="dataLabels"
            [plotOptions]="plotOptions"
            [colors]="chartColors"
            [stroke]="stroke"
            [tooltip]="tooltip"
            [responsive]="responsive"
          ></apx-chart>

          <div class="chart-center">
            <div class="chart-center__value">{{ total }}</div>
            <div class="chart-center__label">Total (L)</div>
          </div>
        </div>

        <ul class="chart-legend" *ngIf="legendItems.length">
          <li *ngFor="let item of legendItems; let i = index" class="chart-legend__item" (click)="onLegendClick(item)">
            <span class="chart-legend__swatch" [style.background]="item.color"></span>
            <span class="chart-legend__label">{{ item.label }}</span>
            <span class="chart-legend__value">{{ item.value }}</span>
            <span class="chart-legend__percent">{{ item.percent }}%</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./donut-chart-card.component.css']
})
export class DonutChartCardComponent {
  @Input() title = 'By Reason';
  @Input() total = 75;
  @Input() legendItems: DonutLegendItem[] = [];
  @Input() colors: string[] = ['#6b8ef6', '#5dc6c2', '#f0c14e', '#d779f9', '#f28f56', '#4eb5a5'];
  @Output() sliceClick = new EventEmitter<DonutLegendItem>();

  series: number[] = [25, 16, 15, 9, 7, 3];
  labels: string[] = ['Price', 'Competition', 'Budget Cut', 'Timeline Slip', 'Product Fit', 'Other'];
  chart!: NonNullable<ApexOptions['chart']>;
  legend!: NonNullable<ApexOptions['legend']>;
  dataLabels!: NonNullable<ApexOptions['dataLabels']>;
  plotOptions!: NonNullable<ApexOptions['plotOptions']>;
  chartColors: string[] = this.colors;
  stroke!: NonNullable<ApexOptions['stroke']>;
  tooltip!: NonNullable<ApexOptions['tooltip']>;
  responsive!: NonNullable<ApexOptions['responsive']>;
  selectedItem: DonutLegendItem | null = null;

  ngOnInit(): void {
    this.chart = {
      type: 'donut',
      toolbar: { show: false },
      sparkline: { enabled: false },
      parentHeightOffset: 0,
      foreColor: '#4b5563',
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const index = config?.dataPointIndex ?? 0;
          const item = this.legendItems[index];
          if (item) {
            this.onLegendClick(item);
          }
        }
      }
    };
    this.legend = { show: false };
    this.dataLabels = { enabled: false };
    this.plotOptions = {
      pie: {
        donut: {
          size: '72%',
          background: 'transparent'
        }
      }
    };
    this.chartColors = [...this.colors];
    this.stroke = { width: 0 };
    this.tooltip = { enabled: true };
    this.responsive = [
      {
        breakpoint: 768,
        options: {
          chart: { width: 280, height: 280 },
          legend: { show: false }
        }
      }
    ];
  }

  ngOnChanges(): void {
    const nextSeries = this.legendItems.map(item => Number(item.value || 0));
    this.series = nextSeries.length ? nextSeries : [0];
    this.labels = this.legendItems.map(item => item.label);
    this.chartColors = this.legendItems.length ? this.legendItems.map(item => item.color) : [...this.colors];
  }

  onLegendClick(item: DonutLegendItem): void {
    this.selectedItem = item;
    this.sliceClick.emit(item);
  }
}
