import { Sidebar } from './../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../layout/header/header";

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar],
  templateUrl: './form.html',
  styleUrl: './form.css'
})
export class Form implements OnChanges {

  @Input() title: string = '';
  @Input() fields: any[] = [];
  @Input() model: any;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancelForm  = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ name: string, value: any }>();

  formData: any = {};
  originalOptions: { [key: string]: any[] } = {};
  openDropdown: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['model'] && changes['model'].currentValue) {
      this.formData = { ...this.model };
    }

    if (changes['fields']) {
      this.fields.forEach(field => {
        if (field.type === 'select' && field.options?.length > 0) {
          // Cache the original options
          this.originalOptions[field.name] = [...field.options];
        }
        
        // Initialize nested objects for checkboxes if not present
        if (field.type === 'checkbox' && !this.formData[field.name]) {
          this.formData[field.name] = {};
        }
      });
    }
  }

  toggleDropdown(fieldName: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === fieldName ? null : fieldName;
  }

  selectOption(field: any, option: any) {
    this.formData[field.name] = option.value;
    this.fieldChange.emit({ name: field.name, value: option.value });
    field.onChange?.(option.value);
    this.openDropdown = null;
    
    // Reset filtered options when selection is made
    if (this.originalOptions[field.name]) {
      field.options = [...this.originalOptions[field.name]];
    }
  }

  filterDropdownOptions(field: any, event: any) {
    const searchText = event.target.value.toLowerCase();
    
    if (!this.originalOptions[field.name]) {
      this.originalOptions[field.name] = [...field.options];
    }

    if (!searchText) {
      field.options = [...this.originalOptions[field.name]];
    } else {
      field.options = this.originalOptions[field.name].filter(opt => 
        opt.label.toLowerCase().includes(searchText)
      );
    }
  }

  // Close dropdowns when clicking outside
  hostClick() {
    this.openDropdown = null;
  }

  submit(form: any) {
    if (form.valid) {
      this.formSubmit.emit(this.formData);
    } else {
      Object.values(form.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }

  cancel() {
    this.cancelForm.emit();
  }
}
