import { Component } from '@angular/core';
import { Header } from "../../../../layout/header/header";
import { Sidebar } from "../../../../layout/sidebar/sidebar";
import { Pageheader } from "../../../../shared/pageheader/pageheader";
import { Form } from "../../../../shared/form/form";
import { Breadcrumb } from '../../../../models/breadcrumb';
import { SalesDirectorService } from '../../../../service/sales-director.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../service/toast.service';
import { ConfirmDialogService } from '../../../../service/confirm-dialog.service';
import { DemoMachineDropdown, DemoModel, LeadDropdown, OpportunityDropdown } from '../../../../models/PlanDemo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-plan-demo',
  standalone: true,
  imports: [Header, Sidebar, Pageheader, Form, CommonModule],
  templateUrl: './add-plan-demo.html',
  styleUrl: './add-plan-demo.css',
})
export class AddPlanDemo {

  constructor(
    private router: Router,
    private salesdirectorservice: SalesDirectorService,
    private route: ActivatedRoute,
      private toastService: ToastService,
      private confirmService: ConfirmDialogService
  ) {}

  headerTitle = 'Add Demo';

  headerBreadcrumbs: Breadcrumb[] = [];
  isEditMode = false;

  demoId!: number;

  formInitialData: any = {};


  leadList: LeadDropdown[] = [];
opportunityList: OpportunityDropdown[] = [];
demoMachineList: DemoMachineDropdown[] = [];


  demoFields: any[] = [

    {    
      name: 'leadId',   
      label: 'Lead',
      type: 'select',
      placeholder: 'Select Lead',   
      required: true,   
      options: [],  
      searchable: true
  },
  
  {
    name: 'opportunityId',
    label: 'Opportunity',
    type: 'select',
    placeholder: 'Select Opportunity',
    required: true,
    options: [],
    searchable: true
  },

  {
    name: 'demoProductId',
    label: 'Demo Machine',
    type: 'select',
    placeholder: 'Select Demo Machine',
    required: true,
    options: [],
    searchable: true
  },
  {
    name: 'demoStartDate',
    label: 'Start Time',
    type: 'datetime-local',
    required: true
  },

  {
    name: 'demoEndDate',
    label: 'End Time',
    type: 'datetime-local',
    required: true
  },

  {
    name: 'demoRemarks1',
    label: 'Remark',
    type: 'textarea'
  }

];

//  ngOnInit(): void {

//   const demo = history.state.demo;
//   console.log("History State Demo:", demo);

//   if (demo) {

//     this.isEditMode = true;
//     this.demoId = demo.demoId;

//     // Load Lead Dropdown
//     this.salesdirectorservice.getLeadDropdown().subscribe((leadRes: any) => {

//       const leadOptions = leadRes.map((l: any) => ({
//         label: `Lead ID - ${l.leadId}`,
//         value: l.leadId
//       }));

//       const leadIndex = this.demoFields.findIndex(
//         f => f.name === 'leadId'
//       );

//       this.demoFields[leadIndex] = {
//         ...this.demoFields[leadIndex],
//         options: leadOptions
//       };

//       this.demoFields = [...this.demoFields];

//       // Select Lead
//       this.formInitialData.leadId = demo.leadId;

//       // Load Opportunity Dropdown
//       this.salesdirectorservice
//         .getOpportunityDropdown(demo.leadId)
//         .subscribe((oppRes: any) => {

//           const oppOptions = oppRes.map((o: any) => ({
//     label: o.productSecondaryName,
//     value: o.oppOpportunityId,
//     productId: o.productId
// }));

//           const oppIndex = this.demoFields.findIndex(
//             f => f.name === 'opportunityId'
//           );

//           this.demoFields[oppIndex] = {
//             ...this.demoFields[oppIndex],
//             options: oppOptions
//           };

//           this.demoFields = [...this.demoFields];

//           // Select Opportunity
//           this.formInitialData.opportunityId = demo.opportunityId;

//           // Find selected Opportunity
//           const selectedOpp = oppOptions.find(
//             (o: any) => Number(o.value) === Number(demo.opportunityId)
//           );

//           if (!selectedOpp) {
//             this.toastService.error('Selected Opportunity not found');
//             return;
//           }

//           // Load Demo Machine Dropdown
//           this.salesdirectorservice
//             .getDemoMachineDropdown(selectedOpp.productId)
//             .subscribe((machineRes: any) => {

//               const machineOptions = machineRes.map((m: any) => ({
//                 label: `${m.serialNumber} - ${m.location}`,
//                 value: m.demoProductId
//               }));

//               const machineIndex = this.demoFields.findIndex(
//                 f => f.name === 'demoProductId'
//               );

//               this.demoFields[machineIndex] = {
//                 ...this.demoFields[machineIndex],
//                 options: machineOptions
//               };

//               this.demoFields = [...this.demoFields];

//               this.formInitialData = {
//     leadId: demo.leadId,
//     opportunityId: demo.opportunityId,
//     demoProductId: demo.demoProductId,
//     demoStartDate: demo.startDate,
//     demoEndDate: demo.endDate,
//     demoRemarks1: demo.remarks
// };

//             });

//         });

//     });

//   } else {

//     this.loadLeadDropdown();

//   }

ngOnInit(): void {

  this.demoId = Number(this.route.snapshot.paramMap.get('id'));
  this.isEditMode = !!this.demoId;

  this.headerBreadcrumbs = [
    { label: 'Home', route: '/salesdirector' },
    { label: 'Demo', route: '/planDemo' },
    { label: this.isEditMode ? 'Edit Demo' : 'Add Demo' }
  ];

  if (!this.isEditMode) {
    this.loadLeadDropdown();
    return;
  }

  this.salesdirectorservice.getDemoById(this.demoId).subscribe({

    next: (response: any) => {

      const demo = response.data;

      console.log("Demo Response", demo);

      // -----------------------------
      // Lead Dropdown
      // -----------------------------
      this.salesdirectorservice.getLeadDropdown().subscribe((leadRes: any) => {

        const leadOptions = leadRes.map((l: any) => ({
          label: `Lead ID - ${l.leadId}`,
          value: l.leadId
        }));

        const leadIndex = this.demoFields.findIndex(
          f => f.name === 'leadId'
        );

        this.demoFields[leadIndex] = {
          ...this.demoFields[leadIndex],
          options: leadOptions
        };

        this.demoFields = [...this.demoFields];

        // -----------------------------
        // Opportunity Dropdown
        // -----------------------------
        this.salesdirectorservice
          .getOpportunityDropdown(demo.leadId)
          .subscribe((oppRes: any) => {

            const oppOptions = oppRes.map((o: any) => ({
              label: o.productSecondaryName,
              value: o.oppOpportunityId,
              productId: o.productId
            }));

            const oppIndex = this.demoFields.findIndex(
              f => f.name === 'opportunityId'
            );

            this.demoFields[oppIndex] = {
              ...this.demoFields[oppIndex],
              options: oppOptions
            };

            this.demoFields = [...this.demoFields];

            const selectedOpp = oppOptions.find(
              (o: any) => Number(o.value) === Number(demo.opportunityId)
            );

            if (!selectedOpp) {
              console.log("Opportunity not found");
              return;
            }

            // -----------------------------
            // Demo Machine Dropdown
            // -----------------------------
            this.salesdirectorservice
              .getDemoMachineDropdown(selectedOpp.productId)
              .subscribe((machineRes: any) => {

                const machineOptions = machineRes.map((m: any) => ({
                  label: `${m.serialNumber} - ${m.location}`,
                  value: m.demoProductId
                }));

                const machineIndex = this.demoFields.findIndex(
                  f => f.name === 'demoProductId'
                );

                this.demoFields[machineIndex] = {
                  ...this.demoFields[machineIndex],
                  options: machineOptions
                };

                this.demoFields = [...this.demoFields];

                // -----------------------------
                // Finally set values
                // -----------------------------
                this.formInitialData = {
                  leadId: demo.leadId,
                  opportunityId: demo.opportunityId,
                  demoProductId: demo.demoProductId,
                  demoStartDate: demo.startDate,
                  demoEndDate: demo.endDate,
                  demoRemarks1: demo.remarks
                };

                console.log("Form Data =", this.formInitialData);

              });

          });

      });

    },

    error: (err) => {
      console.error(err);
      this.toastService.error("Failed to load demo");
    }

  });





  this.headerBreadcrumbs = [
    {
      label: 'Home',
      route: '/salesdirector'
    },
    {
      label: 'Demo',
      route: '/planDemo'
    },
    {
      label: this.isEditMode ? 'Edit Demo' : 'Add Demo'
    }
  ];

}

saveDemo(data: any): void {

  console.log("Form Data", data);

 const selectedOpportunity = this.demoFields
.find(f => f.name === 'opportunityId')
?.options
?.find((o:any)=>Number(o.value)===Number(data.opportunityId));

if(!selectedOpportunity){

    this.toastService.error("Please select a valid Opportunity");

    return;

}

const payload: DemoModel = {

    opportunityId: Number(data.opportunityId),

    demoProductId: Number(data.demoProductId),

    startDate: data.demoStartDate,

    endDate: data.demoEndDate,

    remarks: data.demoRemarks1

};

  console.log('Payload', payload);

  const apiCall = this.isEditMode
    ? this.salesdirectorservice.updatePlanDemo(this.demoId, payload)
    : this.salesdirectorservice.createPlanDemo(payload);

  apiCall.subscribe({

    next: () => {

      this.toastService.success(
        `Demo ${this.isEditMode ? 'updated' : 'created'} successfully`
      );

      this.router.navigate(['/planDemo']);

    },

    error: err => {

      console.error(err);

      this.toastService.error(
        err?.error?.message || 'Failed to save Demo'
      );

    }

  });

}

onCancel(): void {

  this.router.navigate(['/planDemo']);

}
private loadLeadDropdown(): void {

  this.salesdirectorservice.getLeadDropdown().subscribe(res => {

    const options = (Array.isArray(res) ? res : [res]).map((l: any) => ({

      label: `Lead ID - ${l.leadId}`,

      value: l.leadId

    }));

    const index = this.demoFields.findIndex(
      f => f.name === 'leadId'
    );

    this.demoFields[index] = {

      ...this.demoFields[index],

      options

    };

    this.demoFields = [...this.demoFields];

  });

}

private loadOpportunityDropdown(leadId: number): void {

  const machineIndex = this.demoFields.findIndex(
    f => f.name === 'demoProductId'
  );

  this.demoFields[machineIndex] = {
    ...this.demoFields[machineIndex],
    options: []
  };

  this.demoFields = [...this.demoFields];

  this.salesdirectorservice
    .getOpportunityDropdown(leadId)
    .subscribe(res => {

      const options = (Array.isArray(res) ? res : [res]).map((o: any) => ({
    label: o.productSecondaryName,
    value: o.oppOpportunityId,
    productId: o.productId
}));

      const index = this.demoFields.findIndex(
        f => f.name === 'opportunityId'
      );

      this.demoFields[index] = {
        ...this.demoFields[index],
        options
      };

      this.demoFields = [...this.demoFields];

    });

}

selectedProductId!: number;
onModelChange(event: any): void {

  if (event.name === 'leadId') {

    this.formInitialData.opportunityId = null;
    this.formInitialData.demoProductId = null;

    const oppIndex = this.demoFields.findIndex(
      f => f.name === 'opportunityId'
    );

    const machineIndex = this.demoFields.findIndex(
      f => f.name === 'demoProductId'
    );

    this.demoFields[oppIndex] = {
      ...this.demoFields[oppIndex],
      options: []
    };

    this.demoFields[machineIndex] = {
      ...this.demoFields[machineIndex],
      options: []
    };

    this.demoFields = [...this.demoFields];

    this.loadOpportunityDropdown(event.value);

  }

  if (event.name === 'opportunityId') {

    this.formInitialData.demoProductId = null;

    const option = this.demoFields
      .find(f => f.name === 'opportunityId')
      ?.options
      ?.find((o: any) => Number(o.value) === Number(event.value));

    if (option) {
      this.loadDemoMachineDropdown(option.productId);
    }

  }

}

private loadDemoMachineDropdown(productId: number): void {

  this.salesdirectorservice
    .getDemoMachineDropdown(productId)
    .subscribe(res => {

      console.log("API Response =", res);

      const options = (Array.isArray(res) ? res : [res]).map((d: any) => ({

        label: `${d.serialNumber} - ${d.location}`,
        value: d.demoProductId

      }));

      console.log("Dropdown Options =", options);

      const index = this.demoFields.findIndex(
        f => f.name === 'demoProductId'
      );

      this.demoFields[index] = {
        ...this.demoFields[index],
        options
      };

      console.log(this.demoFields[index]);

      this.demoFields = [...this.demoFields];

    });

}

}
