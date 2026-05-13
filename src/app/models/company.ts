export interface Company
{
  companyId: number;
  companyName: string;
  panNumber?: string;
  tinNumber?: string;
  cinNumber?: string;
  tanNumber?: string;
  serviceTaxNumber?: string;
  serviceTaxNumber2?: string;
  salesTaxNumber?: string;
  exciseNumber?: string;
  exciseNumber2?: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  country?: string;
  bankName?: string;
  branch?: string;
  acName?: string;
  acNo?: string;
  ifsc?: string;
  createdBy?: any;
  createdTime?: string;
  modifiedBy?: any;
  modifiedTime?: string | null;
  status?: number;
}
