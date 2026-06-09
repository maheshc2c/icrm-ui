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
    this.formSubmit.emit(this.formData);
  }

  cancel() {
    this.cancelForm.emit();
  }

  /* ================= SEARCHABLE DROPDOWN ================= */
  onSearchInput(field: any, keyword: string): void {
    const term = (keyword || '').toLowerCase();
    if (term.length >= 1) {
      field._filtered = (field.options || []).filter((opt: any) =>
        opt.label.toLowerCase().includes(term)
      );
    } else {
      field._filtered = field.options || [];
    }
    field._open = true;
    this.fieldChange.emit({ name: field.name, value: keyword });
  }

  selectSearchableOption(field: any, opt: any): void {
    this.formData[field.name] = opt.value;
    field._open = false;
    field._filtered = null;
    this.fieldChange.emit({ name: field.name, value: opt.value });
  }

  closeDropdownDelayed(field: any): void {
    setTimeout(() => { field._open = false; }, 200);
  }
}