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
 
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  errors: any = {};
  touched: any = {};
 

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['model'] && changes['model'].currentValue) {
  //      this.formData = { ...this.model };
  //   }
   
 
  //   // ✅ Initialize nested objects for checkboxes if not present
  //   this.fields.forEach(field => {
  //     if (field.type === 'checkbox' && !this.formData[field.name]) {
  //       this.formData[field.name] = {};
  //     }
  //   });
  // }
 
  ngOnChanges(changes: SimpleChanges) {
    if (changes['model'] && changes['model'].currentValue) {
      this.formData = { ...this.model };
    }
 
    if (changes['fields']) {
      this.fields.forEach(field => {
        // Set defaults so template bindings don't explode
        if (this.formData[field.name] === undefined) {
          this.formData[field.name] = field.type === 'checkbox' ? {} : null;
        }
 
        // Cache options for searchable dropdown filtering
        if (field.type === 'select' && Array.isArray(field.options)) {
          // For searchable dropdowns
          field._filtered = null;
          field._open = false;
        }
 
        // Ensure nested objects for checkboxes
        if (field.type === 'checkbox' && !this.formData[field.name]) {
          this.formData[field.name] = {};
        }
      });
    }
  }
 
  // Close any open searchable dropdown(s)
  hostClick() {
    this.fields.forEach(field => {
      if (field?.type === 'select' && field.searchable) {
        field._open = false;
      }
    });
  }
 
  /* ================= SEARCHABLE DROPDOWN ================= */
  onSearchInput(field: any, keyword: string): void {
    const term = (keyword || '').toLowerCase();
    const baseOptions = field.options || [];
 
    if (term.length >= 1) {
      field._filtered = baseOptions.filter((opt: any) =>
        (opt?.label || '').toLowerCase().includes(term)
      );
    } else {
      field._filtered = baseOptions;
    }
    field._open = true;
  }
 
  selectSearchableOption(field: any, opt: any): void {
    this.formData[field.name] = opt.value;
    field._open = false;
    field._filtered = null;
    this.revalidateField(field.name);
    this.fieldChange.emit({ name: field.name, value: opt.value });
    field.onChange?.(opt.value);
  }
 
  onInputChange(field: any, value: any): void {
    this.formData[field.name] = value;
    this.revalidateField(field.name);
    this.fieldChange.emit({ name: field.name, value });
    field.onChange?.(value);
  }
 
  closeDropdownDelayed(field: any): void {
    setTimeout(() => {
      field._open = false;
    }, 200);
  }
 
  getSelectedLabel(field: any): string {
    const value = this.formData[field.name];
    if (value === null || value === undefined || value === '') return '';
    const opt = field.options?.find((o: any) => o.value === value);
    return opt ? opt.label : value;
  }
 
  /* ================= CHECKBOX GROUP ================= */
  getCheckboxValue(fieldName: string, optionValue: string): boolean {
    if (!this.formData[fieldName]) {
      this.formData[fieldName] = {};
    }
    return !!this.formData[fieldName][optionValue];
  }
 
  onCheckboxChange(fieldName: string, optionValue: string, isChecked: boolean) {
    if (!this.formData[fieldName]) {
      this.formData[fieldName] = {};
    }
    this.formData[fieldName][optionValue] = isChecked;
    this.revalidateField(fieldName);
    this.fieldChange.emit({ name: fieldName, value: this.formData[fieldName] });
    this.onFieldInput(fieldName);
  }
 
  /* ================= RADIO GROUP ================= */
  onRadioClick(fieldName: string, optionValue: any, event: Event) {
    if (this.formData[fieldName] === optionValue) {
      event.preventDefault();
      this.formData[fieldName] = null;
      this.revalidateField(fieldName);
      this.fieldChange.emit({ name: fieldName, value: null });
    } else {
      this.formData[fieldName] = optionValue;
      this.revalidateField(fieldName);
      this.fieldChange.emit({ name: fieldName, value: optionValue });
    }
  }

  /* ================= VALIDATION ================= */
  revalidateField(fieldName: string): void {
    delete this.errors[fieldName];
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      const err = this.validateField(field);
      if (err) {
        this.errors[fieldName] = err;
      }
    }
  }
  validateField(field: any): string | null {
    const value = this.formData[field.name];
 
    // Required
    if (field.required) {
      if (field.type === 'checkbox') {
        // Check if at least one checkbox is selected
        if (!value || Object.values(value).every(v => !v)) {
          return `${field.label} is required`;
        }
      } else if (value === null || value === undefined || value === '') {
        return `${field.label} is required`;
      }
    }
 
    // Pattern (only validate when something is provided)
    if (field.pattern && value !== null && value !== undefined && value !== '') {
      try {
        const re = new RegExp(field.pattern);
        if (!re.test(String(value))) {
          return `Invalid ${field.label} format`;
        }
      } catch {
        // ignore invalid regex patterns
      }
    }
 
    // Min / Max (numeric)
    if (field.min !== undefined && value !== null && value !== '' && Number(value) < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }
    if (field.max !== undefined && value !== null && value !== '' && Number(value) > field.max) {
      return `${field.label} must be less than ${field.max}`;
    }
 
   // Email Validation
  if (
    field.type === 'email' &&
    value &&
    !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(value)
  ) {
    return 'Please enter a valid email address';
  }
 
  //mobile validation
  if (
  field.name === 'contactMobileNo' &&
  value &&
  !/^\d{10}$/.test(value)
) {
  return 'Mobile number must be 10 digits';
}
 
    return null;
  }
 
  submit(form: any) {
    this.errors = {};
    let firstInvalidFieldName: string | null = null;
 
    this.fields.forEach(field => {
      const err = this.validateField(field);
      if (err) {
        this.errors[field.name] = err;
        this.touched[field.name] = true;
        if (!firstInvalidFieldName) {
          firstInvalidFieldName = field.name;
        }
      }
    });
 
    if (Object.keys(this.errors).length > 0) {
      // Mark controls touched so template-driven validation UI can show
      if (form?.controls) {
        Object.values(form.controls).forEach((control: any) => control?.markAsTouched?.());
      }
      // Focus first invalid field
      if (firstInvalidFieldName) {
        setTimeout(() => {
          const element = document.getElementById('form-field-' + firstInvalidFieldName);
          if (element) {
            // If it's a form element (input, select, textarea) - focus it directly
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
              element.focus();
            } else if (element.tagName === 'DIV') {
              // For checkbox or radio groups (div containers) - focus first input
              const firstInput = element.querySelector('input') as HTMLElement;
              if (firstInput) {
                firstInput.focus();
              }
            }
          }
        }, 0);
      }
      return;
    }
 
    this.formSubmit.emit(this.formData);
  }
 
  onFieldInput(fieldName: string) {
    this.touched[fieldName] = true;
    // Find the field object by name
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      const err = this.validateField(field);
      if (err) {
        this.errors[fieldName] = err;
      } else {
        delete this.errors[fieldName];
      }
    }
  }
 
  clearError(fieldName: string) {
    delete this.errors[fieldName];
  }
 
  cancel() {
    this.cancelForm.emit();
  }
}