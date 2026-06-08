import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* ✅ UPDATED INTERFACE */
export interface SearchFieldConfig {
  key: string;                 // companyName, email, status
  label: string;               // Label text
  placeholder?: string;        // Optional
  type?: 'text' | 'email' | 'number' | 'date' | 'select'| 'datetime-local';

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
  @Output() fieldChange = new EventEmitter<{ key: string; value: any }>();


  ngOnInit() {
  this.fields.forEach(f => {
    this.values[f.key] = null;   // ✅ force placeholder
  });
}

// ngOnChanges(changes: SimpleChanges): void {
//     if (changes['fields']) {
//       const nextValues: { [key: string]: any } = {};
//       this.fields.forEach(f => {
//         nextValues[f.key] = null;
//       });
//       this.values = nextValues;
//     }
//   }
  
  onInput(changedKey?: string) {
    this.searchChange.emit(this.values);
    if (changedKey) {
      this.fieldChange.emit({ key: changedKey, value: this.values[changedKey] });
    }
  }

  // clear() {
  //   this.values = {};
  //   this.searchChange.emit(this.values);
  // }

  clear() {
    const cleared: { [key: string]: any } = {};
    this.fields.forEach(f => {
      cleared[f.key] = null;
    });
    this.values = cleared;
    this.searchChange.emit(this.values);
  }
}
