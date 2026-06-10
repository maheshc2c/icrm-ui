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
    console.log('FIELDS UPDATED:', this.fields);
  }

  this.fields.forEach(field => {

    if (this.formData[field.name] === undefined) {
    this.formData[field.name] = null;
  }
    if (field.type === 'checkbox' && !this.formData[field.name]) {
      this.formData[field.name] = {};
    }
  });
}

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

  submit() {

  this.errors = {};

  this.fields.forEach(field => {

    const error = this.validateField(field);

    if (error) {
      this.errors[field.name] = error;
    }

  });

  if (Object.keys(this.errors).length > 0) {
    return;
  }

  this.formSubmit.emit(this.formData);
}

  cancel() {
    this.cancelForm.emit();
  }

  //helper for validation
  validateField(field: any): string | null {

  const value = this.formData[field.name];

  // Required
  if (
    field.required &&
    (value === null || value === undefined || value === '')
  ) {
    return `${field.label} is required`;
  }

  // Min
  if (
    field.min !== undefined &&
    value !== null &&
    value !== '' &&
    Number(value) < field.min
  ) {
    return `${field.label} must be at least ${field.min}`;
  }

  // Max
  if (
    field.max !== undefined &&
    value !== null &&
    value !== '' &&
    Number(value) > field.max
  ) {
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

}