import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

/* ✅ UPDATED INTERFACE */
export interface SearchFieldConfig {
  key: string;                 // companyName, email, status
  label: string;               // Label text
  placeholder?: string;        // Optional
  type?: 'text' | 'email' | 'number' | 'date' | 'select'| 'native-select' | 'datetime-local';
  dependsOn?: string;          // ✅ Add dependsOn property for conditional display

  /* 🔽 DROPDOWN OPTIONS (only for type = select) */
  options?: { label: string; value: any }[];
  searchable?: boolean;        // ✅ Added searchable property
  dynamicLoad?: (search: string) => Observable<{ label: string; value: any }[]>; // ✅ Dynamic API load function
  _filtered?: any[];           // For searchable dropdown state
  _loading?: boolean;          // For loading state
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
  openDropdown: string | null = null;

  @Output() searchChange = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any }>();
  @Output() dropdownSearch = new EventEmitter<{ key: string; query: string }>();


  ngOnInit() {
    this.fields.forEach(f => {
      this.values[f.key] = null;   // ✅ force placeholder
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // No longer caching options since they can be mutated dynamically by the parent!
  }
  
  onInput(changedKey?: string) {
    this.searchChange.emit(this.values);
    if (changedKey) {
      this.fieldChange.emit({ key: changedKey, value: this.values[changedKey] });
    }
  }

  toggleDropdown(fieldKey: string, event: Event) {
    event.stopPropagation();
    const isOpening = this.openDropdown !== fieldKey;
    this.openDropdown = isOpening ? fieldKey : null;
    if (isOpening) {
      this.dropdownSearch.emit({ key: fieldKey, query: '' });
    }
  }

  selectOption(field: SearchFieldConfig, option: any) {
    this.values[field.key] = option.value;
    this.onInput(field.key); // Ensure fieldChange is emitted!
    this.openDropdown = null;
    field._filtered = undefined;
  }

  getSelectedLabel(field: SearchFieldConfig): string {
    const val = this.values[field.key];
    if (val === null || val === undefined || val === '') return '';
    const opt = (field.options || []).find((o: any) => o.value === val);
    return opt ? opt.label : val;
  }

  filterDropdownOptions(field: SearchFieldConfig, event: any) {
    const searchText = event.target.value;

    if (field.dynamicLoad) {
      field._loading = true;
      field.dynamicLoad(searchText).subscribe({
        next: (results) => {
          field._filtered = results;
          field._loading = false;
        },
        error: (err) => {
          console.error('Failed to load dynamic options:', err);
          field._loading = false;
        }
      });
    } else {
      const baseOptions = field.options || [];
      const searchLower = searchText.toLowerCase();

      if (!searchText) {
        field._filtered = baseOptions;
      } else {
        field._filtered = baseOptions.filter(opt => 
          opt.label.toLowerCase().includes(searchLower)
        );
      }
    }
    this.dropdownSearch.emit({ key: field.key, query: event.target.value });
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
