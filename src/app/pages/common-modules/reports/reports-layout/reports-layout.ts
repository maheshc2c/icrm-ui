import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Pageheader } from '../../../../shared/pageheader/pageheader';

@Component({
  selector: 'app-reports-layout',
  standalone: true,
  imports: [CommonModule, Pageheader],
  templateUrl: './reports-layout.html',
  styleUrl: './reports-layout.css'
})
export class ReportsLayoutComponent {
  @Input() title = 'Reports';
  @Input() breadcrumbs: Breadcrumb[] = [];
}
