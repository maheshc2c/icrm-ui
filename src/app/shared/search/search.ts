import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* ✅ UPDATED INTERFACE */
export interface SearchFieldConfig {
  key: string;                 // companyName, email, status
  label: string;               // Label text
  placeholder?: string;        // Optional
  type?: 'text' | 'email' | 'number' | 'date' | 'select'| 'datetime-local';
  dependsOn?: string;          // ✅ Add dependsOn property for conditional display

  /* 🔽 DROPDOWN OPTIONS (only for type = select) */
  options?: { label: string; value: any }[];
  searchable?: boolean;        // ✅ Added searchable property
  _filtered?: any[];           // For searchable dropdown state
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
    this.openDropdown = this.openDropdown === fieldKey ? null : fieldKey;
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
    const searchText = event.target.value.toLowerCase();
    const baseOptions = field.options || [];

    if (!searchText) {
      field._filtered = baseOptions;
    } else {
      field._filtered = baseOptions.filter(opt => 
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
