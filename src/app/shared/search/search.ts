import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* ✅ UPDATED INTERFACE */
export interface SearchFieldConfig {
  key: string;                 // companyName, email, status
  label: string;               // Label text
  placeholder?: string;        // Optional
  type?: 'text' | 'email' | 'number' | 'date' | 'select'| 'datetime-local';

  /* 🔽 DROPDOWN OPTIONS (only for type = select) */
  options?: { label: string; value: any }[];
  searchable?: boolean;        // ✅ Added searchable property
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit, OnChanges {

  @Input() fields: SearchFieldConfig[] = [];

  values: { [key: string]: any } = {};
  originalOptions: { [key: string]: any[] } = {};
  openDropdown: string | null = null;

  @Output() searchChange = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any }>();


  ngOnInit() {
    this.fields.forEach(f => {
      this.values[f.key] = null;   // ✅ force placeholder
      if (f.type === 'select' && f.options) {
        this.originalOptions[f.key] = [...f.options];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.fields.forEach(f => {
        if (f.type === 'select' && f.options) {
          this.originalOptions[f.key] = [...f.options];
        }
      });
    }
  }
  
  onInput(changedKey?: string) {
    this.searchChange.emit(this.values);
    if (changedKey) {
      this.fieldChange.emit({ key: changedKey, value: this.values[changedKey] });
    }
  }

  toggleDropdown(fieldKey: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === fieldKey ? null : fieldKey;
  }

  selectOption(field: SearchFieldConfig, option: any) {
    this.values[field.key] = option.value;
    this.onInput();
    this.openDropdown = null;
    
    // Reset filtered options when selection is made
    if (this.originalOptions[field.key]) {
      field.options = [...this.originalOptions[field.key]];
    }
  }

  filterDropdownOptions(field: SearchFieldConfig, event: any) {
    const searchText = event.target.value.toLowerCase();
    
    if (!this.originalOptions[field.key]) {
      this.originalOptions[field.key] = [...(field.options || [])];
    }

    if (!searchText) {
      field.options = [...this.originalOptions[field.key]];
    } else {
      field.options = this.originalOptions[field.key].filter(opt => 
        opt.label.toLowerCase().includes(searchText)
      );
    }
  }

  // Close dropdowns when clicking outside
  hostClick() {
    this.openDropdown = null;
  }

  clear() {
    const cleared: { [key: string]: any } = {};
    this.fields.forEach(f => {
      cleared[f.key] = null;
    });
    this.values = cleared;
    this.searchChange.emit(this.values);
  }
}
