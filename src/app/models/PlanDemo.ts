export interface DemoModel {

    // demoId?: number;

    // leadId: number;

    // opportunityId: number;

    // productId: number;

    // demoProductId: number;

    // demoStartDate: string;

    // demoEndDate: string;

    // demoRemarks1: string;

    // demoRemarks2?: string;

    // demoRemarks3?: string;


    demoId?: number;

    opportunityId: number;

    demoProductId: number;

    startDate: string;

    endDate: string;

    remarks: string;



}

export interface LeadDropdown {

    leadId: number;

    displayName: string;

}

export interface OpportunityDropdown {

    oppOpportunityId: number;

    productId: number;

    displayName: string;

}

export interface DemoMachineDropdown {

    demoProductId: number;

    serialNumber: string;

    location: string;

}