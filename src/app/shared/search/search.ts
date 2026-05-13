import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* ✅ UPDATED INTERFACE */
export interface SearchFieldConfig {
  key: string;                 // companyName, email, status
  label: string;               // Label text
  placeholder?: string;        // Optional
  type?: 'text' | 'email' | 'number' | 'date' | 'select';

  /* 🔽 DROPDOWN OPTIONS (only for type = select) */
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {

  @Input() fields: SearchFieldConfig[] = [];

  values: { [key: string]: any } = {};

  @Output() searchChange = new EventEmitter<any>();


  ngOnInit() {
  this.fields.forEach(f => {
    this.values[f.key] = null;   // ✅ force placeholder
  });
}

  
  onInput() {
    this.searchChange.emit(this.values);
  }

  clear() {
    this.values = {};
    this.searchChange.emit(this.values);
  }
}
