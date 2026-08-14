import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { ReportsLayoutComponent } from '../reports-layout/reports-layout';
import { DonutChartCardComponent, DonutLegendItem } from './donut-chart-card.component';

@Component({
  selector: 'app-opportunity-lost-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
    ReportsLayoutComponent,
    DonutChartCardComponent
  ],
  templateUrl: './opportunity-lost-dashboard.component.html',
  styleUrls: ['./opportunity-lost-dashboard.component.css']
})
export class OpportunityLostDashboardComponent implements OnInit {
  title = 'Opportunity Lost Dashboard';
  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Reports', route: '/reports/funnel' },
    { label: 'Opportunity Lost' }
  ];

  filterForm!: FormGroup;

  currentLevel: 1 | 2 = 1;
  selectedCategory: string = '';
  selectedType: 'Reason' | 'Competitor' = 'Reason';
  selectedColor: string = '';
  drilldownRows: Array<{ label: string; value: number; fill: number }> = [];

  timelineOptions = ['Week', 'Month', 'Quarter', 'Year'];

  reasonChart: DonutLegendItem[] = [
    { label: 'Price', value: 25, percent: 33, color: '#5d7fe8' },
    { label: 'Competition', value: 16, percent: 21, color: '#52b9b9' },
    { label: 'Budget Cut', value: 15, percent: 20, color: '#f0c24f' },
    { label: 'Timeline Slip', value: 9, percent: 12, color: '#d981ee' },
    { label: 'Product Fit', value: 7, percent: 9, color: '#f39d64' },
    { label: 'Other', value: 3, percent: 4, color: '#d9d9d9' }
  ];

  competitorChart: DonutLegendItem[] = [
    { label: 'Competitor A', value: 22, percent: 29, color: '#5d7fe8' },
    { label: 'Competitor B', value: 15, percent: 20, color: '#f0c24f' },
    { label: 'Competitor C', value: 13, percent: 17, color: '#52b9b9' },
    { label: 'Competitor D', value: 8, percent: 11, color: '#d981ee' },
    { label: 'In-house Build', value: 12, percent: 16, color: '#f39d64' },
    { label: 'Others', value: 5, percent: 7, color: '#d9d9d9' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      region: ['All Regions'],
      user: ['All Users'],
      segment: ['All Segments'],
      timeline: ['Week']
    });

    this.filterForm.valueChanges.subscribe(filters => {
      this.updateStaticData();
    });
  }

  updateStaticData(): void {
    const randomize = (arr: DonutLegendItem[]) => {
      return arr.map(item => {
        const newValue = Math.max(1, Math.floor(Math.random() * 50));
        return { ...item, value: newValue };
      }).map((item, _, array) => {
        const total = array.reduce((sum, i) => sum + i.value, 0);
        return { ...item, percent: Math.round((item.value / total) * 100) };
      });
    };

    this.reasonChart = randomize([...this.reasonChart]);
    this.competitorChart = randomize([...this.competitorChart]);
  }

  get totalReason(): number {
    return this.reasonChart.reduce((sum, item) => sum + item.value, 0);
  }

  get totalCompetitor(): number {
    return this.competitorChart.reduce((sum, item) => sum + item.value, 0);
  }

  onSliceClick(item: DonutLegendItem, type: 'Reason' | 'Competitor'): void {
    this.currentLevel = 2;
    this.selectedCategory = item.label;
    this.selectedType = type;
    this.selectedColor = item.color;
    
    // Using static mock data based on click
    const rows = [
      { label: 'Central', value: item.value },
      { label: 'East', value: Math.max(1, Math.round(item.value / 2)) },
      { label: 'North', value: Math.max(1, Math.round(item.value / 3)) },
      { label: 'South1', value: Math.max(1, Math.round(item.value / 4)) },
      { label: 'South2', value: Math.max(1, Math.round(item.value / 1.5)) },
      { label: 'South3', value: Math.max(1, Math.round(item.value / 1.2)) },
      { label: 'West1', value: Math.max(1, Math.round(item.value / 5)) }
    ];
    
    const maxValue = Math.max(...rows.map(row => row.value), 1);
    this.drilldownRows = rows.map(row => ({
      ...row,
      fill: (row.value / maxValue) * 100
    }));
  }

  goToLevel1(): void {
    this.currentLevel = 1;
    this.selectedCategory = '';
  }
}
