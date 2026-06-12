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
  originalOptions: { [key: string]: any[] } = {};
  errors: any = {};

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
          this.originalOptions[field.name] = [...field.options];
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
    const baseOptions = this.originalOptions[field.name] || field.options || [];

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
    this.fieldChange.emit({ name: field.name, value: opt.value });
    field.onChange?.(opt.value);
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
    this.fieldChange.emit({ name: fieldName, value: this.formData[fieldName] });
  }

  /* ================= RADIO GROUP ================= */
  onRadioClick(fieldName: string, optionValue: any, event: Event) {
    if (this.formData[fieldName] === optionValue) {
      event.preventDefault();
      this.formData[fieldName] = null;
      this.fieldChange.emit({ name: fieldName, value: null });
    }
  }

  /* ================= VALIDATION ================= */
  validateField(field: any): string | null {
    const value = this.formData[field.name];

    // Required
    if (field.required && (value === null || value === undefined || value === '')) {
      return `${field.label} is required`;
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

    return null;
  }

  submit(form: any) {
    this.errors = {};

    this.fields.forEach(field => {
      const err = this.validateField(field);
      if (err) {
        this.errors[field.name] = err;
      }
    });

    if (Object.keys(this.errors).length > 0) {
      // Mark controls touched so template-driven validation UI can show
      if (form?.controls) {
        Object.values(form.controls).forEach((control: any) => control?.markAsTouched?.());
      }
      return;
    }

    this.formSubmit.emit(this.formData);
  }

  cancel() {
    this.cancelForm.emit();
  }
}
