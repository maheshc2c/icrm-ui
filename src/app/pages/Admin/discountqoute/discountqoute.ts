import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../shared/pageheader/pageheader';
import { Adminservice } from '../../../service/adminservice';
import { Router } from '@angular/router';
import { DiscountQuoteModel } from '../../../models/discountqoute-model';

@Component({
  selector: 'app-discountqoute',
  imports: [Header, Sidebar, Pageheader, FormsModule],
  templateUrl: './discountqoute.html',
  styleUrl: './discountqoute.css',
})
export class Discountqoute {

  constructor(
    private adminservice: Adminservice,
    private router: Router
  ) {}

  // ✅ form values
  form = {
    countryHead: 0,
    nsm: 0,
    rbm: 0
  };

  // ✅ API data storage
  roles: DiscountQuoteModel[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  // ✅ LOAD DATA FROM BACKEND
  loadData() {
    this.adminservice.getDiscountQuotes().subscribe({
      next: (data: DiscountQuoteModel[]) => {

        this.roles = data;

        // map API → form
        data.forEach(r => {
          if (r.roleId === 7) this.form.rbm = r.max;
          if (r.roleId === 8) this.form.nsm = r.max;
          if (r.roleId === 9) this.form.countryHead = r.max;
        });

        console.log('Loaded form:', this.form);
      },
      error: (err) => {
        console.error('Load failed', err);
      }
    });
  }

  // ✅ SUBMIT (DYNAMIC + BACKEND COMPATIBLE)
  onSubmit() {

    const rbm = Number(this.form.rbm);
    const nsm = Number(this.form.nsm);
    const country = Number(this.form.countryHead);

    // build payload based on backend data
    const payload: DiscountQuoteModel[] = this.roles.map(r => {

      if (r.roleId === 7) {
        return { ...r, min: 0, max: rbm };
      }

      if (r.roleId === 8) {
        return { ...r, min: rbm, max: nsm };
      }

      if (r.roleId === 9) {
        return { ...r, min: nsm, max: 100 };
      }

      return r;
    });

    console.log('FINAL PAYLOAD =>', payload);

    this.adminservice.saveDiscountQuote(payload).subscribe({
      next: (res) => {
        console.log('SUCCESS =>', res);
        alert('Saved successfully ✅');
        this.loadData(); // refresh
        this.router.navigate(['/admindashboard']);
      },
      error: (err) => {
        console.error('ERROR =>', err);
        alert('Save failed ❌ ' + err.status);
      }
    });
  }

  // ✅ RESET
  // onCancel() {
  //   this.loadData();/
  // }

   onCancel(): void {
    this.router.navigate(['/admindashboard']);
  }
}