import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Breadcrumb } from '../../models/breadcrumb';

@Component({
  selector: 'app-pageheader',
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './pageheader.html',
  styleUrl: './pageheader.css'
})
export class Pageheader {


  @Input() title!: string;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() homeIcon: string = 'fas fa-home';


}
